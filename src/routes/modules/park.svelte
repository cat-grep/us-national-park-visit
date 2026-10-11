<script lang="ts">
  // Proportional-symbol map of recreation visits per park (replaces the
  // ArcGIS web map). Circle AREA encodes visits; the scale is fixed across
  // years so sizes are comparable while the year changes.
  import { scaleSqrt } from "d3-scale";
  import { max } from "d3-array";
  import UsMap from "$lib/map/UsMap.svelte";
  import type { OverlayCtx } from "$lib/map/projection";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import YearSlider from "$lib/components/YearSlider.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import Sparkline from "$lib/components/Sparkline.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app, setView } from "$lib/state.svelte";
  import { tokens, fmtFull, fmtShort, fmtPct } from "$lib/theme";
  import { DESIGNATED } from "$lib/events";
  import type { Dataset, Park, ParkYear } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  const t = $derived(tokens(app.dark));
  const maxRec = max(data.parkYear, (d) => d.rec) ?? 1;
  const LEGEND_VALUES = [1_000_000, 5_000_000, 12_000_000];

  interface Mark {
    park: Park;
    row: ParkYear;
    prev?: ParkYear;
  }

  const marks = $derived.by(() => {
    const rows = data.byYear.get(app.year) ?? [];
    const prevRows = new Map((data.byYear.get(app.year - 1) ?? []).map((r) => [r.code, r]));
    return rows
      .filter((r) => r.rec > 0)
      .map((row) => ({ park: data.parkByCode.get(row.code)!, row, prev: prevRows.get(row.code) }))
      .sort((a, b) => b.row.rec - a.row.rec); // big circles first so small ones stay on top
  });

  const maxRadius = (w: number) => Math.max(14, Math.min(42, w * 0.045));
  const radiusScale = (w: number) => scaleSqrt().domain([0, maxRec]).range([0, maxRadius(w)]);

  // Hover state (container-relative position).
  let box = $state({ width: 0, height: 0 });
  let wrap = $state<HTMLDivElement>();
  let hover = $state<{ mark: Mark; x: number; y: number } | null>(null);

  function onHover(mark: Mark, e: PointerEvent) {
    const rect = wrap!.getBoundingClientRect();
    hover = { mark, x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function select(code: string) {
    app.park = app.park === code ? null : code;
  }

  function onKey(e: KeyboardEvent, code: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(code);
    }
  }

  const dimmed = (p: Park) => app.region !== null && p.region !== app.region;
  const change = (m: Mark) => (m.prev && m.prev.rec > 0 ? m.row.rec / m.prev.rec - 1 : null);

  const selectedPark = $derived(app.park ? data.parkByCode.get(app.park) : undefined);
  const selectedHistory = $derived(
    app.park ? (data.byPark.get(app.park) ?? []).map((r) => ({ year: r.year, value: r.rec })) : [],
  );
  const selectedMark = $derived(marks.find((m) => m.park.code === app.park));
  const top10 = $derived(marks.filter((m) => !dimmed(m.park)).slice(0, 10));

  const tableRows = $derived(
    marks.map((m) => ({
      name: m.park.name,
      state: m.park.state,
      region: m.park.region,
      rec: m.row.rec,
      rank: m.row.rank,
    })),
  );
</script>

<ViewHeader>
  {#snippet controls()}
    <div class="slider"><YearSlider /></div>
    <div class="chips" role="group" aria-label="Filter by NPS region">
      <button class="chip" aria-pressed={app.region === null} onclick={() => (app.region = null)}>All regions</button>
      {#each data.regions as r}
        <button class="chip" aria-pressed={app.region === r} onclick={() => (app.region = app.region === r ? null : r)}>{r}</button>
      {/each}
    </div>
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption={`Recreation visits by park, ${app.year}`}
    rows={tableRows}
    columns={[
      { key: "name", label: "Park" },
      { key: "state", label: "State" },
      { key: "region", label: "Region" },
      { key: "rec", label: "Recreation visits", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "rank", label: "Rank (total visits)", numeric: true },
    ]}
  />
{:else}
  <div class="layout">
    <div class="map-wrap card" bind:this={wrap} bind:clientWidth={box.width} bind:clientHeight={box.height}>
      <UsMap fill={() => t.land} label={`Map of recreation visits by national park in ${app.year}`}>
        {#snippet overlay({ area, layout, k }: OverlayCtx)}
          {@const r = radiusScale(layout.width)}
          {#each marks.filter((m) => layout.areaOf(m.park.state) === area) as m (m.park.code)}
            {@const p = layout.project(m.park.lon, m.park.lat, m.park.state)}
            {#if p}
              <circle
                cx={p[0]}
                cy={p[1]}
                r={Math.max(2, r(m.row.rec)) / k}
                class="park"
                class:selected={app.park === m.park.code}
                class:dimmed={dimmed(m.park)}
                fill={t.series[0]}
                role="button"
                tabindex="0"
                aria-label={`${m.park.name}: ${fmtFull(m.row.rec)} recreation visits`}
                onpointermove={(e) => onHover(m, e)}
                onpointerleave={() => (hover = null)}
                onfocus={() => (hover = null)}
                onclick={() => select(m.park.code)}
                onkeydown={(e) => onKey(e, m.park.code)}
              />
            {/if}
          {/each}
        {/snippet}
      </UsMap>

      {#if box.width}
        {@const lr = radiusScale(box.width - 16)}
        {@const lh = 2 * lr(LEGEND_VALUES.at(-1)!) + 8}
        {@const cx = lr(LEGEND_VALUES.at(-1)!) + 4}
        <svg class="size-legend" width={cx * 2 + 110} height={lh} role="img" aria-label="Circle size legend: 1M, 5M and 12M visits">
          {#each LEGEND_VALUES as v, i}
            {@const rr = lr(v)}
            <circle {cx} cy={lh - 2 - rr} r={rr} class="legend-circle" />
            <line x1={cx} x2={cx * 2 + 8} y1={lh - 2 - 2 * rr} y2={lh - 2 - 2 * rr} class="legend-tick" />
            <text x={cx * 2 + 12} y={lh - 2 - 2 * rr} dy="0.32em" class="legend-text">{fmtShort(v)}{i === LEGEND_VALUES.length - 1 ? " visits" : ""}</text>
          {/each}
        </svg>
      {/if}

      {#if hover}
        {@const c = change(hover.mark)}
        <Tooltip x={hover.x} y={hover.y} bounds={box}>
          <strong>{hover.mark.park.name}</strong><br />
          <span class="muted">{hover.mark.park.state} · {hover.mark.park.region}</span><br />
          {fmtFull(hover.mark.row.rec)} recreation visits<br />
          Rank #{hover.mark.row.rank} of {marks.length} (total visits)
          {#if c !== null}<br /><span class="muted">{fmtPct(c)} vs. {app.year - 1}</span>{/if}
        </Tooltip>
      {/if}
    </div>

    <aside class="panel card" aria-live="polite">
      {#if selectedPark}
        <div class="panel-head">
          <div>
            <h2>{selectedPark.name}</h2>
            <p class="muted">{selectedPark.state} · {selectedPark.region} region</p>
          </div>
          <button class="icon-btn" onclick={() => (app.park = null)} aria-label="Clear selection">×</button>
        </div>
        {#if selectedMark}
          <dl class="stats">
            <div><dt>{app.year} recreation visits</dt><dd>{fmtFull(selectedMark.row.rec)}</dd></div>
            <div><dt>Rank (total visits)</dt><dd>#{selectedMark.row.rank}</dd></div>
          </dl>
        {:else}
          <p class="muted">No visits reported in {app.year}.</p>
        {/if}
        <Sparkline
          points={selectedHistory}
          year={app.year}
          minYear={data.years[0]}
          maxYear={data.years.at(-1)!}
          color={t.series[0]}
          label="Recreation visits per year"
        />
        {#if DESIGNATED[selectedPark.code]}
          <p class="note">
            Designated a national park in {DESIGNATED[selectedPark.code]}; earlier years were recorded under its previous status.
          </p>
        {/if}
        {#if selectedPark.firstYear > data.years[0]}
          <p class="note">Visits are reported from {selectedPark.firstYear} onward.</p>
        {/if}
        <button onclick={() => setView("rank")}>Show in rankings</button>
      {:else}
        <h2>Most visited in {app.year}</h2>
        <p class="muted">{app.region ? `${app.region} region` : "All regions"} · click a park for its history</p>
        <ol class="top">
          {#each top10 as m (m.park.code)}
            <li>
              <button class="row" onclick={() => select(m.park.code)}>
                <span>{m.park.name}</span>
                <span class="num">{fmtShort(m.row.rec)}</span>
              </button>
            </li>
          {/each}
        </ol>
      {/if}
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

  .park {
    fill-opacity: 0.7;
    stroke: var(--surface);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
    transition: r 0.35s ease, opacity 0.2s;
  }

  .park:hover,
  .park:focus-visible {
    fill-opacity: 1;
    outline: none;
    stroke: var(--fg-1);
    stroke-width: 1.5;
  }

  .park.selected {
    fill-opacity: 1;
    stroke: var(--fg-1);
    stroke-width: 2.5;
  }

  .park.dimmed {
    opacity: 0.12;
  }

  .size-legend {
    display: block;
    margin-top: 0.25rem;
  }

  .legend-circle {
    fill: none;
    stroke: var(--fg-3);
  }

  .legend-tick {
    stroke: var(--fg-3);
    stroke-dasharray: 2 2;
  }

  .legend-text {
    font-size: 11px;
    fill: var(--fg-2);
  }

  .panel h2 {
    font-size: 1.15rem;
    margin: 0;
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
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
    margin: 0.15rem 0 0.75rem;
    font-size: 0.85rem;
  }

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
  }

  dt {
    font-size: 0.75rem;
    color: var(--fg-3);
  }

  dd {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
  }

  .note {
    font-size: 0.8rem;
    color: var(--fg-2);
    background: var(--bg-2);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
  }

  .top {
    margin: 0;
    padding-left: 1.4rem;
  }

  .top li {
    color: var(--fg-3);
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

  @media (max-width: 1000px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
