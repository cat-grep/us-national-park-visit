<script lang="ts">
  // Recreation vs. non-recreation visits per year, with event annotations.
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app } from "$lib/state.svelte";
  import { tokens, baseOption, valueAxis, categoryAxis, legend, iconEndLabel, fmtFull } from "$lib/theme";
  import { eventMarkLine } from "$lib/events";
  import type { Dataset } from "$lib/data";
  import holiday from "../../data/holiday.png";
  import construct from "../../data/construct.png";

  let { data }: { data: Dataset } = $props();

  const t = $derived(tokens(app.dark));
  const totals = data.yearTotals;
  const years = totals.map((d) => String(d.year));

  const line = (name: string, values: number[], color: string, icon: string, withEvents = false) => ({
    name,
    type: "line",
    data: values,
    showSymbol: false,
    lineStyle: { width: 2, color },
    itemStyle: { color },
    endLabel: iconEndLabel(t, name, icon),
    labelLayout: { moveOverlap: "shiftY" },
    ...(withEvents ? { markLine: eventMarkLine(t.muted, t.ink2) } : {}),
  });

  const option = $derived({
    ...baseOption(t),
    legend: legend(t),
    grid: { left: 8, right: 170, top: 40, bottom: 8, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: "axis",
      formatter: (ps: { dataIndex: number }[]) => {
        const d = totals[ps[0].dataIndex];
        return `<b>${d.year}</b><br/>Recreation: ${fmtFull(d.rec)}<br/>Non-recreation: ${fmtFull(d.non)}<br/>
          <b>Total: ${fmtFull(d.rec + d.non)}</b>`;
      },
    },
    xAxis: categoryAxis(t, years, { boundaryGap: false }),
    yAxis: valueAxis(t, { min: 0 }),
    series: [
      line("Recreation", totals.map((d) => d.rec), t.series[0], holiday, true),
      line("Non-recreation", totals.map((d) => d.non), t.series[1], construct),
    ],
  });

  const tableRows = totals.map((d) => ({
    year: d.year,
    rec: d.rec,
    non: d.non,
    share: d.non / (d.rec + d.non),
  }));
</script>

<ViewHeader />

{#if app.showTable}
  <DataTable
    caption="Recreation and non-recreation visits per year"
    rows={tableRows}
    columns={[
      { key: "year", label: "Year" },
      { key: "rec", label: "Recreation", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "non", label: "Non-recreation", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "share", label: "Non-recreation share", numeric: true, format: (v) => `${((v as number) * 100).toFixed(1)}%` },
    ]}
  />
{:else}
  <div class="chart lines" use:echart={{ option }} role="img" aria-label="Line chart: recreation visits grow from about 53 million to 92 million, while non-recreation visits level off near 24 million after 1990. Use the table view for exact values."></div>
{/if}

<style>
  .lines {
    height: min(560px, 70vh);
    min-height: 360px;
  }
</style>
