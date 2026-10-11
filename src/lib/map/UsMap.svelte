<script lang="ts">
  // Reusable U.S. basemap. D3 computes the projection, paths and zoom
  // transform; Svelte renders the SVG. Layers are drawn through the `overlay`
  // snippet, called once for the main map (inside the zoom group) and once per
  // territory inset.
  import { onMount, type Snippet } from "svelte";
  import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
  import { select } from "d3-selection";
  import Icon from "$lib/components/Icon.svelte";
  import { buildLayout, loadStates, FIPS_TO_USPS, type OverlayCtx, type StateFeature } from "./projection";

  let {
    fill,
    label,
    selectedState = null,
    onStateClick,
    onStateHover,
    overlay,
  }: {
    fill: (usps: string) => string;
    label: string;
    selectedState?: string | null;
    onStateClick?: (usps: string) => void;
    onStateHover?: (usps: string | null, e?: PointerEvent) => void;
    overlay?: Snippet<[OverlayCtx]>;
  } = $props();

  let states = $state<StateFeature[]>([]);
  let width = $state(0);
  let svg: SVGSVGElement;
  let transform = $state<ZoomTransform>(zoomIdentity);
  let zoomer: ZoomBehavior<SVGSVGElement, unknown>;

  const height = $derived(Math.max(260, Math.min(width * 0.62, 640)));
  const layout = $derived(width && states.length ? buildLayout(states, width, height) : null);
  const mainStates = $derived(states.filter((f) => !["60", "78"].includes(f.id)));
  const interactive = $derived(!!onStateClick);

  onMount(() => {
    loadStates().then((s) => (states = s));

    zoomer = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      // Wheel-zoom only with Ctrl/⌘ so the page still scrolls; one-finger
      // touch pans only once zoomed in, otherwise the page scrolls.
      .filter((e: Event) => {
        if (e.type === "wheel") return (e as WheelEvent).ctrlKey || (e as WheelEvent).metaKey;
        if (e.type.startsWith("touch")) return (e as TouchEvent).touches.length > 1 || transform.k > 1;
        return !(e as MouseEvent).button;
      })
      .on("zoom", (e) => (transform = e.transform));
    select(svg).call(zoomer).on("dblclick.zoom", null).style("touch-action", "pan-y");
  });

  $effect(() => {
    // Constrain panning to the map area whenever the size changes.
    zoomer?.translateExtent([
      [0, 0],
      [width, height],
    ]);
  });

  const zoomBy = (f: number) => zoomer.scaleBy(select(svg), f);
  const reset = () => zoomer.transform(select(svg), zoomIdentity);

  function stateKey(e: KeyboardEvent, usps: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onStateClick?.(usps);
    }
  }
</script>

<div class="map" bind:clientWidth={width}>
  <svg bind:this={svg} {width} {height} role="group" aria-label={label}>
    {#if layout}
      <g transform={transform.toString()}>
        {#each mainStates as f (f.id)}
          {@const usps = FIPS_TO_USPS[f.id]}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex (role is "button" whenever tabindex is set) -->
          <path
            d={layout.path(f)}
            fill={fill(usps)}
            class="state"
            class:selected={selectedState === usps}
            class:interactive
            role={interactive ? "button" : undefined}
            tabindex={interactive ? 0 : undefined}
            aria-label={interactive ? f.properties.name : undefined}
            onclick={() => onStateClick?.(usps)}
            onkeydown={(e) => stateKey(e, usps)}
            onpointermove={(e) => onStateHover?.(usps, e)}
            onpointerleave={() => onStateHover?.(null)}
          />
        {/each}
        {@render overlay?.({ area: "main", layout, k: transform.k })}
      </g>

      {#each layout.insets as inset (inset.area)}
        {@const f = states.find((s) => FIPS_TO_USPS[s.id] === inset.area)}
        <g class="inset">
          <text x={inset.x} y={inset.y - 5} class="inset-label">{inset.label}</text>
          <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} class="frame" />
          {#if f}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex (role is "button" whenever tabindex is set) -->
            <path
              d={layout.path(f)}
              fill={fill(inset.area)}
              class="state"
              class:selected={selectedState === inset.area}
              class:interactive
              role={interactive ? "button" : undefined}
              tabindex={interactive ? 0 : undefined}
              aria-label={interactive ? f.properties.name : undefined}
              onclick={() => onStateClick?.(inset.area)}
              onkeydown={(e) => stateKey(e, inset.area)}
              onpointermove={(e) => onStateHover?.(inset.area, e)}
              onpointerleave={() => onStateHover?.(null)}
            />
          {/if}
          {@render overlay?.({ area: inset.area, layout, k: 1 })}
        </g>
      {/each}
    {/if}
  </svg>

  {#if !layout}
    <div class="loading" style:height="{height}px">Loading map…</div>
  {/if}

  <div class="zoom-controls">
    <button onclick={() => zoomBy(1.6)} aria-label="Zoom in">+</button>
    <button onclick={() => zoomBy(1 / 1.6)} aria-label="Zoom out">−</button>
    <button onclick={reset} aria-label="Reset zoom" disabled={transform.k === 1 && transform.x === 0 && transform.y === 0}>
      <Icon name="reset" size={14} />
    </button>
  </div>
  <p class="hint">Drag to pan when zoomed · Ctrl/⌘ + scroll to zoom</p>
</div>

<style>
  .map {
    position: relative;
    width: 100%;
  }

  svg {
    display: block;
    overflow: hidden;
    border-radius: 8px;
    background: var(--surface);
  }

  .state {
    stroke: var(--surface);
    stroke-width: 0.75;
    vector-effect: non-scaling-stroke;
    stroke-linejoin: round;
  }

  .state.interactive {
    cursor: pointer;
  }

  .state.interactive:hover,
  .state:focus-visible {
    stroke: var(--fg-1);
    stroke-width: 1.5;
    outline: none;
  }

  .state.selected {
    stroke: var(--fg-1);
    stroke-width: 2;
  }

  .frame {
    fill: none;
    stroke: var(--axis);
    stroke-dasharray: 3 2;
  }

  .inset-label {
    font-size: 10px;
    fill: var(--fg-3);
  }

  .loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--fg-3);
  }

  .zoom-controls {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .zoom-controls button {
    width: 30px;
    height: 30px;
    padding: 0;
    display: grid;
    place-items: center;
    font-size: 1.1rem;
    line-height: 1;
    background: var(--surface);
    color: var(--fg-1);
    border: 1px solid var(--border-color);
  }

  .zoom-controls button:hover:not(:disabled) {
    background: var(--bg-2);
  }

  .hint {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: var(--fg-3);
  }
</style>
