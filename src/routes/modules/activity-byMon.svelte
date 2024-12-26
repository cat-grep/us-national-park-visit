<script lang="ts">
  // Import ECharts core and required components
  import * as echarts from "echarts/core";
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
  } from "echarts/components";
  import { BarChart } from "echarts/charts";
  import { LineChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";

  // Import the dataset
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";

  // Import Svelte lifecycle hooks
  import { onMount, onDestroy } from "svelte";

  // Initialize chart on component mount
  onMount(() => {
    initializeChart();
  });

  // Register ECharts components
  echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    BarChart,
    LineChart,
    CanvasRenderer,
    DataZoomInsideComponent,
    DataZoomSliderComponent,
  ]);

  let chart: echarts.ECharts | null = null; // ECharts instance
  let chartContainer: HTMLDivElement | null = null; // Chart container reference

  // Sort dataset by Year and Month
  const sortedData = [...parkData].sort(
    (a, b) => a.Year - b.Year || a.Month - b.Month
  );

  // Group data by Year-Month and aggregate relevant fields
  const groupedData = parkData.reduce(
    (acc, item) => {
      const key = `${item.Year}-${String(item.Month).padStart(2, "0")}`;
      if (!acc[key]) {
        acc[key] = {
          RecreationVisits: 0,
          TentCampers: 0,
          RVCampers: 0,
          Backcountry: 0,
        };
      }
      acc[key].RecreationVisits += item.RecreationVisits;
      acc[key].TentCampers += item.TentCampers;
      acc[key].RVCampers += item.RVCampers;
      acc[key].Backcountry += item.Backcountry;

      return acc;
    },
    {} as Record<
      string,
      {
        RecreationVisits: number;
        TentCampers: number;
        RVCampers: number;
        Backcountry: number;
      }
    >
  );

  // Extract labels and aggregated data
  const yearMonthLabels = Object.keys(groupedData).sort();
  const recreationVisits = yearMonthLabels.map(
    (key) => groupedData[key].RecreationVisits
  );
  const tentCampers = yearMonthLabels.map(
    (key) => groupedData[key].TentCampers
  );
  const rvCampers = yearMonthLabels.map((key) => groupedData[key].RVCampers);
  const backcountry = yearMonthLabels.map(
    (key) => groupedData[key].Backcountry
  );

  // Calculate default data zoom range for a 10-year window
  const totalPoints = yearMonthLabels.length;
  const monthsPerYear = 12;
  const yearsToShow = 10;
  const windowSize = yearsToShow * monthsPerYear;
  const start = 0;
  const end = Math.min((windowSize / totalPoints) * 100, 100); // Zoom percentage

  // ECharts configuration options
  const option = {
    title: {
      text: "Monthly Visits Across Parks",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const recreation =
          params.find((p: any) => p.seriesName === "Recreation Visits")
            ?.value || 0;
        const tentCampers =
          params.find((p: any) => p.seriesName === "Tent Campers")?.value || 0;
        const rvCampers =
          params.find((p: any) => p.seriesName === "RV Campers")?.value || 0;
        const backcountry =
          params.find((p: any) => p.seriesName === "Backcountry")?.value || 0;
        return `
          <strong>${params[0].axisValueLabel}</strong><br/>
          Recreation Visits: ${recreation}<br/>
          Tent Campers: ${tentCampers}<br/>
          RV Campers: ${rvCampers}<br/>
          Backcountry: ${backcountry}<br/>
        `;
      },
    },
    legend: {
      data: ["Recreation Visits", "Tent Campers", "RV Campers", "Backcountry"],
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: yearMonthLabels,
      name: "Year-Month",
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: "value",
      name: "Number of Visitors",
    },
    series: [
      {
        name: "Tent Campers",
        type: "line",
        data: tentCampers,
        itemStyle: { color: "#919e8b" },
      },
      {
        name: "RV Campers",
        type: "line",
        data: rvCampers,
        itemStyle: { color: "#d7ab82" },
      },
      {
        name: "Backcountry",
        type: "line",
        data: backcountry,
        itemStyle: { color: "#6e7074" },
      },
    ],
    dataZoom: [
      { type: "slider", start: start, end: end, bottom: 0 },
      { type: "inside", start: start, end: end },
    ],
  };

  // Function to initialize the chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer); // Initialize ECharts
      chart.setOption(option); // Set chart options
    }
  };

  // Clean up chart instance on component destroy
  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

<!-- Chart container -->
<div id="chart" bind:this={chartContainer}></div>

<style>
  #chart {
    width: 100%; /* Set chart width */
    height: 100%; /* Set chart height */
  }
</style>
