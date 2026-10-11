<script lang="ts">
  // Stacked horizontal bars: recreation + non-recreation visits per park for
  // the selected year, sorted by total. Linked to the global year and park.
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import YearSlider from "$lib/components/YearSlider.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app } from "$lib/state.svelte";
  import { tokens, baseOption, valueAxis, legend, fmtFull } from "$lib/theme";
  import type { Dataset } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  const t = $derived(tokens(app.dark));
  // Already sorted by rank (= total visits) for each year.
  const rows = $derived((data.byYear.get(app.year) ?? []).filter((r) => r.rec + r.non > 0));
  const names = $derived(rows.map((r) => data.parkByCode.get(r.code)!.name));
  const selectedName = $derived(app.park ? data.parkByCode.get(app.park)?.name : undefined);

  const option = $derived({
    ...baseOption(t),
    animationDurationUpdate: 500,
    legend: legend(t, { data: ["Recreation visits", "Non-recreation visits"] }),
    grid: { left: 8, right: 24, top: 36, bottom: 8, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: { dataIndex: number }[]) => {
        const r = rows[ps[0].dataIndex];
        return `<b>${names[ps[0].dataIndex]}</b> · rank #${r.rank}<br/>
          Recreation: ${fmtFull(r.rec)}<br/>Non-recreation: ${fmtFull(r.non)}<br/>
          <b>Total: ${fmtFull(r.rec + r.non)}</b>`;
      },
    },
    xAxis: valueAxis(t, { position: "top" }),
    yAxis: {
      type: "category",
      inverse: true,
      data: names,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: t.axis } },
      axisLabel: {
        color: t.ink2,
        formatter: (v: string) => (v === selectedName ? `{sel|${v}}` : v),
        rich: { sel: { color: t.ink, fontWeight: "bold", backgroundColor: t.grid, padding: [2, 4], borderRadius: 3 } },
      },
    },
    series: [
      {
        name: "Recreation visits",
        type: "bar",
        stack: "total",
        barWidth: "70%",
        data: rows.map((r) => r.rec),
        itemStyle: { color: t.series[0], borderColor: t.surface, borderWidth: 1 },
      },
      {
        name: "Non-recreation visits",
        type: "bar",
        stack: "total",
        data: rows.map((r) => r.non),
        itemStyle: { color: t.series[1], borderColor: t.surface, borderWidth: 1, borderRadius: [0, 4, 4, 0] },
      },
    ],
  });

  function onInit(chart: import("echarts/core").ECharts) {
    chart.on("click", (p) => {
      const r = rows[(p as { dataIndex: number }).dataIndex];
      if (r) app.park = app.park === r.code ? null : r.code;
    });
  }

  const tableRows = $derived(
    rows.map((r, i) => ({ rank: r.rank, name: names[i], rec: r.rec, non: r.non, total: r.rec + r.non })),
  );
</script>

<ViewHeader>
  {#snippet controls()}
    <div class="slider"><YearSlider /></div>
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption={`Visits by park, ${app.year}`}
    rows={tableRows}
    columns={[
      { key: "rank", label: "Rank", numeric: true },
      { key: "name", label: "Park" },
      { key: "rec", label: "Recreation", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "non", label: "Non-recreation", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "total", label: "Total", numeric: true, format: (v) => fmtFull(v as number) },
    ]}
  />
{:else}
  <div
    class="chart"
    style:height="{rows.length * 20 + 70}px"
    use:echart={{ option, onInit }}
    role="img"
    aria-label={`Bar chart of visits per park in ${app.year}. Use the table view for exact values.`}
  ></div>
{/if}

<style>
  .slider {
    flex: 1 1 360px;
    max-width: 640px;
  }
</style>
