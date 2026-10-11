<script lang="ts">
  // Year × month dot matrix of total recreation visits (all parks).
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app } from "$lib/state.svelte";
  import { tokens, baseOption, categoryAxis, seqSteps, fmtFull, fmtShort } from "$lib/theme";
  import type { Dataset } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const t = $derived(tokens(app.dark));
  const years = data.years.map(String);
  const points = data.months.map((m) => [data.years.indexOf(m.year), m.month - 1, m.rec]);
  const maxVal = Math.max(...points.map((p) => p[2]));
  const MAX_SIZE = 18;

  const option = $derived({
    ...baseOption(t),
    grid: { left: 8, right: 16, top: 16, bottom: 64, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      formatter: (p: { data: number[] }) =>
        `<b>${MONTHS[p.data[1]]} ${years[p.data[0]]}</b><br/>${fmtFull(p.data[2])} recreation visits`,
    },
    xAxis: categoryAxis(t, years, { axisLabel: { color: t.muted, interval: 4 }, splitLine: { show: false } }),
    yAxis: categoryAxis(t, MONTHS, { inverse: true, axisLabel: { color: t.ink2 } }),
    visualMap: {
      min: 0,
      max: maxVal,
      dimension: 2,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemHeight: 240,
      itemWidth: 12,
      textStyle: { color: t.muted },
      inRange: { color: seqSteps(t) },
      formatter: (v: number) => fmtShort(v),
    },
    series: [
      {
        type: "scatter",
        data: points,
        symbolSize: (v: number[]) => Math.max(3, Math.sqrt(v[2] / maxVal) * MAX_SIZE),
        itemStyle: { borderColor: t.surface, borderWidth: 1 },
      },
    ],
  });

  const tableRows = data.years.map((y) => {
    const row: Record<string, number> = { year: y };
    for (const m of data.months.filter((d) => d.year === y)) row[MONTHS[m.month - 1]] = m.rec;
    return row;
  });
</script>

<ViewHeader />

{#if app.showTable}
  <DataTable
    caption="Monthly recreation visits, all national parks"
    rows={tableRows}
    columns={[
      { key: "year", label: "Year" },
      ...MONTHS.map((m) => ({ key: m, label: m, numeric: true, format: (v: unknown) => fmtFull(v as number) })),
    ]}
  />
{:else}
  <div class="chart months" use:echart={{ option }} role="img" aria-label="Dot matrix of monthly recreation visits by year: summer months are consistently the busiest. Use the table view for exact values."></div>
{/if}

<style>
  .months {
    height: 520px;
  }
</style>
