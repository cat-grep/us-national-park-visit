<script lang="ts">
  // Bump chart of yearly rank. All parks are drawn as gray context lines;
  // the selected park is highlighted (color follows the selection, never the
  // rank), and the current top 10 are labelled at the line ends.
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import YearSlider from "$lib/components/YearSlider.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app } from "$lib/state.svelte";
  import { tokens, baseOption, categoryAxis, fmtFull } from "$lib/theme";
  import { eventMarkLine } from "$lib/events";
  import type { Dataset } from "$lib/data";

  let { data }: { data: Dataset } = $props();

  const t = $derived(tokens(app.dark));
  const years = data.years.map(String);
  const lastYear = data.years.at(-1)!;
  const lastRank = new Map(data.byYear.get(lastYear)!.map((r) => [r.code, r.rank]));
  const parksByName = [...data.parks].sort((a, b) => a.name.localeCompare(b.name));

  const option = $derived.by(() => {
    const series = data.parks.map((p) => {
      const rows = new Map(data.byPark.get(p.code)!.map((r) => [r.year, r]));
      const selected = app.park === p.code;
      const labelled = selected || (lastRank.get(p.code) ?? 99) <= 10;
      const emphasised = labelled && !selected && app.park === null;
      return {
        id: p.code,
        name: p.name,
        type: "line",
        data: data.years.map((y) => rows.get(y)?.rank ?? null),
        showSymbol: selected,
        symbolSize: 6,
        z: selected ? 10 : 2,
        // With nothing selected, the labelled top 10 are a darker gray so labels connect to them.
        lineStyle: {
          width: selected ? 3 : emphasised ? 1.5 : 1,
          color: selected ? t.series[1] : emphasised ? t.muted : t.context,
        },
        itemStyle: { color: selected ? t.series[1] : t.context },
        emphasis: { focus: "series", lineStyle: { width: 2.5, color: selected ? t.series[1] : t.ink2 } },
        blur: { lineStyle: { opacity: 0.4 } },
        endLabel: {
          show: labelled,
          formatter: "{a}",
          color: selected ? t.ink : t.ink2,
          fontWeight: selected ? "bold" : "normal",
        },
        labelLayout: { moveOverlap: "shiftY" },
        ...(p.code === data.parks[0].code
          ? { markLine: { ...eventMarkLine(t.muted, t.ink2), label: { ...eventMarkLine(t.muted, t.ink2).label, position: "end" } } }
          : {}),
      };
    });

    return {
      ...baseOption(t),
      animation: false, // 63 series: keep selection changes snappy
      grid: { left: 8, right: 190, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        ...baseOption(t).tooltip,
        trigger: "item",
        formatter: (p: { seriesName: string; name: string; value: number }) =>
          `<b>${p.seriesName}</b><br/>${p.name}: rank #${p.value}`,
      },
      xAxis: categoryAxis(t, years, { boundaryGap: false, position: "top" }),
      yAxis: {
        type: "value",
        inverse: true,
        min: 1,
        max: data.parks.length,
        interval: 5,
        axisLabel: { color: t.muted, formatter: (v: number) => (v === 1 ? "#1" : String(v)) },
        splitLine: { lineStyle: { color: t.grid } },
      },
      series,
    };
  });

  function onInit(chart: import("echarts/core").ECharts) {
    chart.on("click", (p) => {
      const id = (p as { seriesId?: string }).seriesId;
      if (id) app.park = app.park === id ? null : id;
    });
  }

  const tableRows = $derived(
    (data.byYear.get(app.year) ?? []).map((r) => ({
      rank: r.rank,
      name: data.parkByCode.get(r.code)!.name,
      total: r.rec + r.non,
    })),
  );
</script>

<ViewHeader>
  {#snippet controls()}
    <label class="field">
      Highlight park
      <select bind:value={app.park}>
        <option value={null}>— none —</option>
        {#each parksByName as p}
          <option value={p.code}>{p.name}</option>
        {/each}
      </select>
    </label>
    {#if app.showTable}
      <div class="slider"><YearSlider /></div>
    {/if}
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption={`Park rankings by total visits, ${app.year}`}
    rows={tableRows}
    columns={[
      { key: "rank", label: "Rank", numeric: true },
      { key: "name", label: "Park" },
      { key: "total", label: "Total visits", numeric: true, format: (v) => fmtFull(v as number) },
    ]}
  />
{:else}
  <div class="chart rank-chart" use:echart={{ option, onInit }} role="img" aria-label="Line chart of each national park's rank by total visits, 1979–2023. Use the table view for exact values."></div>
{/if}

<style>
  .slider {
    flex: 1 1 360px;
    max-width: 640px;
  }

  .rank-chart {
    height: max(720px, 70vh);
    min-height: 1000px;
  }
</style>
