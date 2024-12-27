<script lang="ts">
  // Import ECharts modules
  import * as echarts from "echarts/core";
  import { LineChart } from "echarts/charts";
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  // Register ECharts components
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LineChart,
    CanvasRenderer,
  ]);

  // Import Svelte lifecycle hooks
  import { onMount, onDestroy } from "svelte";

  // Import dataset
  import data from "../../data/US-National-Parks_Use_1979-2023_ByYearByPark_ranked.json";

  // Define color palette for the lines
  const colors = [
    "#dd6b66",
    "#759aa0",
    "#e69d87",
    "#8dc1a9",
    "#ea7e53",
    "#e43c59",
    "#73a373",
    "#73b9bc",
    "#7289ab",
    "#91ca8c",
    "#f49f42",
    "#d18894",
    "#c2af85",
    "#a0a7d4",
    "#b5c7a3",
    "#e4af6e",
  ];

  let chartContainer: HTMLDivElement | null = null; // Chart container reference
  let chart: echarts.ECharts | null = null; // ECharts instance

  // Extract unique parks and years from the data
  const parks = [...new Set(data.map((d) => d.ParkName))];
  const years = [...new Set(data.map((d) => d.Year))].sort((a, b) => a - b);

  // Generate series data for each park
  const series = parks.map((park, index) => {
    return {
      name: park,
      type: "line",
      data: years.map((year) => {
        const record = data.find((d) => d.ParkName === park && d.Year === year);
        return record ? record.Rank : null; // Handle missing ranks
      }),
      emphasis: {
        focus: "series",
      },
      lineStyle: {
        color: colors[index % colors.length], // Assign colors cyclically
      },
      itemStyle: {
        color: colors[index % colors.length], // Match point color with line
      },
      endLabel: {
        show: true,
        formatter: (params: any) => `${params.seriesName}`, // Display park name
      },
    };
  });

  // ECharts configuration
  const option = {
    title: {
      text: "National Park Rankings Over Time",
      left: "center",
    },
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        const year = years[params.dataIndex];
        const park = params.seriesName;
        const rank = params.data !== null ? params.data : "N/A"; // Handle missing ranks
        return `<b>${year} ${park}</b><br>Rank: ${rank}`;
      },
    },
    grid: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 200,
    },
    xAxis: {
      type: "category",
      data: years,
      name: "Year",
      nameGap: 40,
      nameLocation: "middle",
      axisLabel: {
        rotate: 45, // Improve readability for long labels
      },
    },
    yAxis: {
      type: "value",
      inverse: true, // Invert to place rank 1 at the top
      name: "Rank",
      min: 1,
      nameGap: 30,
      nameLocation: "middle",
    },
    series: series,
  };

  // Initialize and render the chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption(option);
    }
  };

  // Mount and cleanup lifecycle hooks
  onMount(() => {
    initializeChart();
    window.addEventListener("resize", () => chart?.resize()); // Handle responsiveness
  });

  onDestroy(() => {
    if (chart) {
      chart.dispose(); // Dispose chart instance on destroy
    }
  });
</script>

<!-- Chart Container -->
<div id="chart-container" bind:this={chartContainer}></div>

<style>
  #chart-container {
    width: 100%; /* Full width of parent container */
    height: 1600px; /* Full height of parent container */
  }
</style>
