<script lang="ts">
  // Overnight stays: tent, RV and backcountry campers. Yearly totals, or a
  // monthly view with a zoomable window (absorbs the former activity-byMon).
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app } from "$lib/state.svelte";
  import { tokens, baseOption, valueAxis, categoryAxis, legend, iconEndLabel, fmtFull } from "$lib/theme";
  import { eventMarkLine } from "$lib/events";
  import type { Dataset } from "$lib/data";
  import tent from "../../data/tent.png";
  import rv from "../../data/rv.png";
  import deer from "../../data/deer.png";

  let { data }: { data: Dataset } = $props();

  let grain = $state<"year" | "month">("year");

  const t = $derived(tokens(app.dark));
  const SERIES = [
    { key: "tent", name: "Tent campers", icon: tent },
    { key: "rv", name: "RV campers", icon: rv },
    { key: "bc", name: "Backcountry", icon: deer },
  ] as const;

  const rows = $derived(grain === "year" ? data.yearTotals : data.months);
  const labels = $derived(
    grain === "year"
      ? data.yearTotals.map((d) => String(d.year))
      : data.months.map((m) => `${m.year}-${String(m.month).padStart(2, "0")}`),
  );

  const option = $derived({
    ...baseOption(t),
    legend: legend(t),
    grid: { left: 8, right: grain === "year" ? 180 : 24, top: 40, bottom: grain === "year" ? 8 : 56, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: "axis",
      valueFormatter: (v: number) => fmtFull(v),
    },
    xAxis: categoryAxis(t, labels, { boundaryGap: false }),
    yAxis: valueAxis(t, { min: 0 }),
    dataZoom:
      grain === "month"
        ? [
            { type: "slider", start: 0, end: 25, bottom: 8, textStyle: { color: t.muted } },
            { type: "inside", start: 0, end: 25 },
          ]
        : [],
    series: SERIES.map((s, i) => ({
      id: s.key,
      name: s.name,
      type: "line",
      data: rows.map((r) => r[s.key]),
      showSymbol: false,
      lineStyle: { width: grain === "year" ? 2 : 1.5, color: t.series[i] },
      itemStyle: { color: t.series[i] },
      endLabel: { ...iconEndLabel(t, s.name, s.icon), show: grain === "year" },
      labelLayout: { moveOverlap: "shiftY" },
      markLine: i === 0 && grain === "year" ? eventMarkLine(t.muted, t.ink2) : { data: [] },
    })),
  });

  const tableRows = data.yearTotals.map((d) => ({ year: d.year, tent: d.tent, rv: d.rv, bc: d.bc }));
</script>

<ViewHeader>
  {#snippet controls()}
    <div class="chips" role="group" aria-label="Time resolution">
      <button class="chip" aria-pressed={grain === "year"} onclick={() => (grain = "year")}>Yearly</button>
      <button class="chip" aria-pressed={grain === "month"} onclick={() => (grain = "month")}>Monthly</button>
    </div>
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption="Overnight stays per year"
    rows={tableRows}
    columns={[
      { key: "year", label: "Year" },
      { key: "tent", label: "Tent campers", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "rv", label: "RV campers", numeric: true, format: (v) => fmtFull(v as number) },
      { key: "bc", label: "Backcountry", numeric: true, format: (v) => fmtFull(v as number) },
    ]}
  />
{:else}
  {#key grain}
    <div class="chart lines" use:echart={{ option }} role="img" aria-label={`Line chart of ${grain === "year" ? "yearly" : "monthly"} tent, RV and backcountry campers. Use the table view for exact values.`}></div>
  {/key}
{/if}

<style>
  .lines {
    height: min(560px, 70vh);
    min-height: 360px;
  }
</style>
