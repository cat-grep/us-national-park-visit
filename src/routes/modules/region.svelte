<script lang="ts">
  // Import ECharts modules
  import * as echarts from "echarts/core";
  import {
    TooltipComponent,
    TitleComponent,
    GridComponent,
    VisualMapComponent,
  } from "echarts/components";
  import { HeatmapChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";

  // Register ECharts components
  echarts.use([
    TooltipComponent,
    TitleComponent,
    GridComponent,
    VisualMapComponent,
    HeatmapChart,
    CanvasRenderer,
  ]);

  // Import data and Svelte lifecycle hooks
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";
  import { onMount, onDestroy } from "svelte";

  // Import region-specific images
  import alaska from "../../data/alaska.jpg";
  import intermountain from "../../data/intermountain.jpg";
  import midwest from "../../data/midwest.jpg";
  import northeast from "../../data/northeast.jpg";
  import pacificwest from "../../data/pacificwest.jpg";
  import southeast from "../../data/southeast.jpg";

  // Map regions to images
  const imgSets: Record<string, string> = {
    Alaska: alaska,
    "Intermountain ": intermountain,
    "Midwest ": midwest,
    "Northeast ": northeast,
    "Pacific West ": pacificwest,
    "Southeast ": southeast,
  };

  let chartContainer: HTMLDivElement | null = null;
  let chart: echarts.ECharts | null = null;

  // Extract unique years and regions from data
  const years = [...new Set(parkData.map((d) => d.Year))].sort((a, b) => a - b);
  const regions = [...new Set(parkData.map((d) => d.Region))];

  // Aggregate data for heatmap
  const aggregatedData = parkData.reduce((acc, item) => {
    const yearIndex = years.indexOf(item.Year);
    const regionIndex = regions.indexOf(item.Region);
    const visits = item.RecreationVisits;

    if (!acc[regionIndex]) acc[regionIndex] = [];
    if (!acc[regionIndex][yearIndex]) acc[regionIndex][yearIndex] = 0;

    acc[regionIndex][yearIndex] += visits;
    return acc;
  }, []);

  // Prepare heatmap data in the format [YearIndex, RegionIndex, Visits]
  const heatmapData = [];
  aggregatedData.forEach((regionData, regionIndex) => {
    if (regionData) {
      regionData.forEach((visits, yearIndex) => {
        if (visits) {
          heatmapData.push([yearIndex, regionIndex, visits]);
        }
      });
    }
  });

  // ECharts Configuration
  const option = {
    tooltip: {
      position: (point, params, dom, rect, size) => {
        const screenHeight = window.innerHeight;
        const mouseY = point[1];

        return mouseY > screenHeight / 2
          ? { top: point[1] - size.contentSize[1] - 10, left: point[0] - size.contentSize[0] / 2 }
          : { top: point[1] + 10, left: point[0] - size.contentSize[0] / 2 };
      },
      formatter: (params) => {
        const year = years[params.data[0]];
        const region = regions[params.data[1]];
        const visits = new Intl.NumberFormat("en-US").format(params.data[2]);
        const imgLink = imgSets[region];
        return `
          <div style="text-align: center;">
            <b>${region} (${year})</b><br>
            Recreation Visits: ${visits}<br>
            <img src="${imgLink}" alt="${region}" style="width: 300px; height: auto; margin-top: 5px;" />
          </div>`;
      },
    },
    title: {
      text: "Annual Recreation Visits to National Parks by Region",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: years,
      name: "Year",
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "category",
      data: regions,
      name: "Region",
      nameLocation: "middle",
      nameGap: 100,
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map((d) => d[2])),
      calculable: true,
      orient: "vertical",
      left: "right",
      top: "middle",
      itemHeight: 600,
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData,
        itemStyle: {
          borderColor: "#e0e6eb",
          borderWidth: 0.5,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  // Initialize chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption(option);
    }
  };

  // Mount lifecycle hook
  onMount(() => {
    initializeChart();
    window.addEventListener("resize", () => chart?.resize());
  });

  // Cleanup lifecycle hook
  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

<!-- Chart Container -->
<div id="chart-container" bind:this={chartContainer}></div>

<style>
  #chart-container {
    width: 100%; /* Full width */
    height: 100%; /* Full height */
  }
</style>
