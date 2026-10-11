<script lang="ts">
  // Choropleth of recreation visits by state (replaces the ArcGIS web map).
  // Values are heavily skewed, so color uses a log scale fixed across years.
  import { onMount } from "svelte";
  import { scaleSequentialLog } from "d3-scale";
  import { extent } from "d3-array";
  import UsMap from "$lib/map/UsMap.svelte";
  import { loadStates, FIPS_TO_USPS } from "$lib/map/projection";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import YearSlider from "$lib/components/YearSlider.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import Sparkline from "$lib/components/Sparkline.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app, setView } from "$lib/state.svelte";
  import { tokens, fmtFull, fmtShort } from "$lib/theme";
  import { groupByYear, type Dataset } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  type Metric = "total" | "perPark";
  let metric = $state<Metric>("total");
  let selected = $state<string | null>(null);
  let names = $state<Record<string, string>>({});

  onMount(() => {
    loadStates().then((s) => {
      names = Object.fromEntries(s.map((f) => [FIPS_TO_USPS[f.id], f.properties.name]));
    });
  });

  const t = $derived(tokens(app.dark));
  const byState = groupByYear(data, "state");
  const value = (g: { rec: number; parks: number }, m: Metric) => (m === "total" ? g.rec : g.rec / g.parks);

  // Fixed domain over all years so colors are comparable through time.
  const color = $derived.by(() => {
    const all = [...byState.values()].flat().map((g) => value(g, metric)).filter((v) => v > 0);
    const [lo, hi] = extent(all) as [number, number];
    return scaleSequentialLog(t.seq).domain([lo, hi]);
  });

  const current = $derived(
    new Map([...byState].map(([s, rows]) => [s, rows.find((r) => r.year === app.year)])),
  );

  const fill = (usps: string) => {
    const g = current.get(usps);
    const v = g ? value(g, metric) : 0;
    return v > 0 ? color(v) : t.noData;
  };

  // Hover tooltip
  let box = $state({ width: 0, height: 0 });
  let wrap = $state<HTMLDivElement>();
  let hover = $state<{ usps: string; x: number; y: number } | null>(null);

  function onStateHover(usps: string | null, e?: PointerEvent) {
    if (!usps || !e) return (hover = null);
    const rect = wrap!.getBoundingClientRect();
    hover = { usps, x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const parksIn = (usps: string) =>
    data.parks
      .filter((p) => p.state === usps)
      .map((p) => ({ park: p, rec: data.byPark.get(p.code)?.find((r) => r.year === app.year)?.rec ?? 0 }))
      .sort((a, b) => b.rec - a.rec);

  const history = $derived(
    selected ? (byState.get(selected) ?? []).map((g) => ({ year: g.year, value: value(g, metric) })) : [],
  );

  // Legend ticks: powers of ten inside the domain.
  const [d0, d1] = $derived(color.domain());
  const legendTicks = $derived(
    Array.from({ length: 12 }, (_, i) => 10 ** i).filter((v) => v >= d0 && v <= d1),
  );
  const legendX = (v: number) => ((Math.log(v) - Math.log(d0)) / (Math.log(d1) - Math.log(d0))) * 220;

  const tableRows = $derived(
    [...current]
      .filter(([, g]) => g && g.rec > 0)
      .map(([s, g]) => ({ state: names[s] ?? s, parks: g!.parks, rec: g!.rec, perPark: Math.round(g!.rec / g!.parks) }))
      .sort((a, b) => b.rec - a.rec),
  );

  const metricLabel = $derived(metric === "total" ? "Recreation visits" : "Average visits per park");
</script>

<ViewHeader>
  {#snippet controls()}
    <div class="slider"><YearSlider /></div>
    <div class="chips" role="group" aria-label="Metric">
      <button class="chip" aria-pressed={metric === "total"} onclick={() => (metric = "total")}>Total visits</button>
      <button class="chip" aria-pressed={metric === "perPark"} onclick={() => (metric = "perPark")}>Average per park</button>
    </div>
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption={`Recreation visits by state, ${app.year}`}
    rows={tableRows}
    columns={[
      { key: "state", label: "State" },
      { key: "parks", label: "National parks", numeric: true },
      { key: "rec", label: "Recreation visits", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "perPark", label: "Average per park", numeric: true, format: (v) => fmtFull(v as number) },
    ]}
  />
{:else}
  <div class="layout">
    <div class="map-wrap card" bind:this={wrap} bind:clientWidth={box.width} bind:clientHeight={box.height}>
      <UsMap
        {fill}
        label={`Choropleth map of ${metricLabel.toLowerCase()} by state in ${app.year}`}
        selectedState={selected}
        onStateClick={(s) => (selected = selected === s ? null : s)}
        {onStateHover}
      />

      <svg class="legend" width="300" height="46" role="img" aria-label={`${metricLabel}, log scale, from ${fmtShort(d0)} to ${fmtShort(d1)}`}>
        <defs>
          <linearGradient id="seq-grad">
            {#each Array.from({ length: 11 }, (_, i) => i / 10) as s}
              <stop offset={s} stop-color={t.seq(s)} />
            {/each}
          </linearGradient>
        </defs>
        <text x="0" y="10" class="legend-title">{metricLabel} (log scale)</text>
        <rect x="0" y="16" width="220" height="10" rx="2" fill="url(#seq-grad)" />
        {#each legendTicks as v}
          <line x1={legendX(v)} x2={legendX(v)} y1="26" y2="30" class="legend-tick" />
          <text x={legendX(v)} y="41" text-anchor="middle" class="legend-text">{fmtShort(v)}</text>
        {/each}
        <rect x="236" y="16" width="10" height="10" rx="2" fill={t.noData} stroke={t.axis} />
        <text x="250" y="25" class="legend-text">None</text>
      </svg>

      {#if hover}
        {@const g = current.get(hover.usps)}
        <Tooltip x={hover.x} y={hover.y} bounds={box}>
          <strong>{names[hover.usps] ?? hover.usps}</strong><br />
          {#if g && g.rec > 0}
            {fmtFull(Math.round(value(g, metric)))} {metric === "total" ? "recreation visits" : "visits per park"}<br />
            <span class="muted">{g.parks} national park{g.parks > 1 ? "s" : ""}</span>
          {:else}
            <span class="muted">No national park with reported visits</span>
          {/if}
        </Tooltip>
      {/if}
    </div>

    <aside class="panel card" aria-live="polite">
      {#if selected}
        {@const list = parksIn(selected)}
        <div class="panel-head">
          <h2>{names[selected] ?? selected}</h2>
          <button class="icon-btn" onclick={() => (selected = null)} aria-label="Clear selection">×</button>
        </div>
        {#if list.length}
          <Sparkline
            points={history}
            year={app.year}
            minYear={data.years[0]}
            maxYear={data.years.at(-1)!}
            color={t.series[0]}
            label={metricLabel}
          />
          <h3>Parks in {app.year}</h3>
          <ul class="parks">
            {#each list as { park, rec } (park.code)}
              <li>
                <button
                  class="row"
                  onclick={() => {
                    app.park = park.code;
                    setView("park");
                  }}
                >
                  <span>{park.name}</span>
                  <span class="num">{rec ? fmtShort(rec) : "—"}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="muted">This state has no national park in the dataset.</p>
        {/if}
      {:else}
        <h2>Explore a state</h2>
        <p class="muted">Click or tab to a state to see its trend and parks.</p>
      {/if}
      <p class="note">
        Parks spanning several states (e.g. Great Smoky Mountains, Yellowstone, Death Valley) are counted entirely in one state, as in the source data.
      </p>
    </aside>
  </div>
{/if}

<style>
  .slider {
    flex: 1 1 360px;
    max-width: 640px;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 1rem;
    align-items: start;
  }

  .map-wrap {
    position: relative;
    padding: 0.5rem;
  }

  .legend {
    display: block;
    margin-top: 0.5rem;
    max-width: 100%;
  }

  .legend-title {
    font-size: 11px;
    fill: var(--fg-2);
  }

  .legend-text {
    font-size: 11px;
    fill: var(--fg-3);
  }

  .legend-tick {
    stroke: var(--fg-3);
  }

  .panel h2 {
    font-size: 1.15rem;
    margin: 0;
  }

  .panel h3 {
    font-size: 0.9rem;
    margin: 0.75rem 0 0.25rem;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .icon-btn {
    background: transparent;
    color: var(--fg-2);
    font-size: 1.4rem;
    line-height: 1;
    padding: 0 0.25rem;
  }

  .muted {
    color: var(--fg-3);
    font-size: 0.85rem;
  }

  .parks {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 0.5rem;
    background: transparent;
    color: var(--fg-1);
    padding: 0.3rem 0.25rem;
    text-align: left;
    border-radius: 4px;
  }

  .row:hover {
    background: var(--bg-2);
  }

  .num {
    font-variant-numeric: tabular-nums;
    color: var(--fg-2);
  }

  .note {
    font-size: 0.8rem;
    color: var(--fg-2);
    background: var(--bg-2);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    margin-top: 1rem;
  }

  @media (max-width: 1000px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
