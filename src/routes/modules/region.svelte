<script lang="ts">
  // Heatmap: NPS region × year, colored by recreation visits.
  // Clicking a cell sets the shared year and region filter.
  import { echart } from "$lib/echarts";
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import { app, setView } from "$lib/state.svelte";
  import { tokens, baseOption, categoryAxis, seqSteps, fmtFull, fmtShort } from "$lib/theme";
  import { groupByYear, type Dataset } from "$lib/data";

  import alaska from "../../data/alaska.jpg";
  import intermountain from "../../data/intermountain.jpg";
  import midwest from "../../data/midwest.jpg";
  import northeast from "../../data/northeast.jpg";
  import pacificwest from "../../data/pacificwest.jpg";
  import southeast from "../../data/southeast.jpg";

  let { data }: { data: Dataset } = $props();

  const regionMaps: Record<string, string> = {
    Alaska: alaska,
    Intermountain: intermountain,
    Midwest: midwest,
    Northeast: northeast,
    "Pacific West": pacificwest,
    Southeast: southeast,
  };

  const t = $derived(tokens(app.dark));
  const years = data.years.map(String);
  const regions = data.regions;
  const byRegion = groupByYear(data, "region");
  const cells = regions.flatMap((reg, ri) =>
    byRegion.get(reg)!.map((g) => [data.years.indexOf(g.year), ri, g.rec, g.parks] as const),
  );
  const maxVal = Math.max(...cells.map((c) => c[2]));

  const option = $derived({
    ...baseOption(t),
    grid: { left: 8, right: 16, top: 8, bottom: 64, containLabel: true },
    tooltip: {
      ...baseOption(t).tooltip,
      formatter: (p: { data: readonly number[] }) => {
        const [xi, ri, v, n] = p.data;
        const reg = regions[ri];
        return `<b>${reg} · ${years[xi]}</b><br/>${fmtFull(v)} recreation visits<br/>${n} parks
          <br/><img src="${regionMaps[reg]}" alt="" style="width:160px;margin-top:6px;border-radius:4px" />`;
      },
    },
    xAxis: categoryAxis(t, years, { splitArea: { show: false }, axisLabel: { color: t.muted, interval: 4 } }),
    yAxis: categoryAxis(t, regions, { inverse: true, axisLabel: { color: t.ink2 } }),
    visualMap: {
      min: 0,
      max: maxVal,
      dimension: 2, // visits (the default, last dimension, is the park count)
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
        type: "heatmap",
        data: cells,
        itemStyle: { borderColor: t.surface, borderWidth: 1 },
        emphasis: { itemStyle: { borderColor: t.ink, borderWidth: 1.5 } },
      },
    ],
  });

  function onInit(chart: import("echarts/core").ECharts) {
    chart.on("click", (p) => {
      const [xi, ri] = (p as { data: number[] }).data;
      app.year = data.years[xi];
      app.region = regions[ri];
    });
  }

  // Table: one row per year, one column per region.
  const tableRows = data.years.map((y) => {
    const row: Record<string, number> = { year: y };
    for (const reg of regions) row[reg] = byRegion.get(reg)!.find((g) => g.year === y)?.rec ?? 0;
    return row;
  });
</script>

<ViewHeader>
  {#snippet controls()}
    {#if app.region}
      <span class="field">Selected: <b>{app.region}, {app.year}</b></span>
      <button onclick={() => setView("park")}>Show these parks on the map</button>
      <button class="ghost" onclick={() => (app.region = null)}>Clear</button>
    {:else}
      <span class="field">Click a cell to select a region and year.</span>
    {/if}
  {/snippet}
</ViewHeader>

{#if app.showTable}
  <DataTable
    caption="Recreation visits by NPS region and year"
    rows={tableRows}
    columns={[
      { key: "year", label: "Year" },
      ...regions.map((r) => ({ key: r, label: r, numeric: true, format: (v: unknown) => fmtFull(v as number) })),
    ]}
  />
{:else}
  <div class="chart heat" use:echart={{ option, onInit }} role="img" aria-label="Heatmap of recreation visits by NPS region and year. Use the table view for exact values."></div>
{/if}

<style>
  .heat {
    height: 460px;
  }

  .ghost {
    background: transparent;
    color: var(--fg-2);
    border: 1px solid var(--border-color);
  }
</style>
