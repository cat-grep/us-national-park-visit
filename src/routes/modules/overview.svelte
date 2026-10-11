<script lang="ts">
  // Landing view: headline numbers, the national trend, and entry points.
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { app, setView, VIEWS } from "$lib/state.svelte";
  import { tokens, baseOption, valueAxis, categoryAxis, fmtShort, fmtFull } from "$lib/theme";
  import { eventMarkLine, EVENTS } from "$lib/events";
  import type { Dataset } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  const t = $derived(tokens(app.dark));
  const totals = data.yearTotals;
  const first = totals[0];
  const last = totals.at(-1)!;
  const total = (y: number) => totals.find((d) => d.year === y)!.rec;

  const topPark = data.parkByCode.get(data.byYear.get(last.year)![0].code)!;
  const covidDrop = total(2020) / total(2019) - 1;

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthAvg = MONTHS.map((_, i) => {
    const rows = data.months.filter((m) => m.month === i + 1);
    return rows.reduce((s, m) => s + m.rec, 0) / rows.length;
  });
  const peakMonth = MONTHS[monthAvg.indexOf(Math.max(...monthAvg))];

  const kpis = [
    { label: `Recreation visits in ${last.year}`, value: fmtShort(last.rec), sub: `across ${last.parks} national parks` },
    { label: `Change since ${first.year}`, value: `×${(last.rec / first.rec).toFixed(1)}`, sub: `from ${fmtShort(first.rec)} visits` },
    { label: `Most visited in ${last.year}`, value: topPark.name, sub: `${topPark.state} · total visits` },
    { label: "2020 vs. 2019", value: `${Math.round(covidDrop * 100)}%`, sub: EVENTS.find((e) => e.year === 2020)!.label },
    { label: "Busiest month", value: peakMonth, sub: "on average, all years" },
  ];

  const option = $derived({
    ...baseOption(t),
    grid: { left: 8, right: 24, top: 24, bottom: 8, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: "axis",
      valueFormatter: (v: number) => fmtFull(v),
    },
    xAxis: categoryAxis(t, totals.map((d) => String(d.year)), { boundaryGap: false }),
    yAxis: valueAxis(t, { min: 0 }),
    series: [
      {
        name: "Recreation visits",
        type: "line",
        data: totals.map((d) => d.rec),
        showSymbol: false,
        lineStyle: { width: 2, color: t.series[0] },
        itemStyle: { color: t.series[0] },
        areaStyle: { color: t.series[0], opacity: 0.08 },
        markLine: eventMarkLine(t.muted, t.ink2),
      },
    ],
  });

  const explore = VIEWS.filter((v) => !["overview", "info"].includes(v.id));
</script>

<ViewHeader tableToggle={false} />

<section class="kpis" aria-label="Key figures">
  {#each kpis as k}
    <div class="kpi card">
      <div class="kpi-label">{k.label}</div>
      <div class="kpi-value">{k.value}</div>
      <div class="kpi-sub">{k.sub}</div>
    </div>
  {/each}
</section>

<section class="card trend">
  <h2>Total recreation visits per year, all national parks</h2>
  <p class="sub">Parks are added to the totals as they begin reporting; dashed lines mark external events.</p>
  <div class="chart-box" use:echart={{ option }} role="img" aria-label={`Line chart: total recreation visits grew from ${fmtShort(first.rec)} in ${first.year} to ${fmtShort(last.rec)} in ${last.year}.`}></div>
</section>

<section aria-label="Explore">
  <h2>Explore</h2>
  <div class="explore">
    {#each explore as v}
      <button class="tile card" onclick={() => setView(v.id)}>
        <Icon name={v.icon} size={22} />
        <span class="tile-title">{v.title}</span>
        <span class="tile-desc">{v.description}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .kpi-label {
    font-size: 0.8rem;
    color: var(--fg-3);
  }

  .kpi-value {
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1.2;
    margin: 0.15rem 0;
  }

  .kpi-sub {
    font-size: 0.8rem;
    color: var(--fg-2);
  }

  .trend {
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.05rem;
    margin: 0 0 0.25rem;
  }

  .sub {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: var(--fg-3);
  }

  .chart-box {
    height: 320px;
  }

  .explore {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    text-align: left;
    color: var(--fg-1);
    background: var(--surface);
    transition: border-color 0.15s, transform 0.15s;
  }

  .tile:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .tile :global(.icon) {
    color: var(--accent);
  }

  .tile-title {
    font-weight: 600;
  }

  .tile-desc {
    font-size: 0.85rem;
    color: var(--fg-2);
  }
</style>
