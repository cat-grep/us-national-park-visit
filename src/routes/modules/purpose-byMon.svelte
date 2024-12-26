<script lang="ts">
  // Import necessary ECharts modules
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

  // Import data and Svelte lifecycle hooks
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";
  import { onMount, onDestroy } from "svelte";

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
  let chartContainer: HTMLDivElement | null = null; // Reference to chart container

  // Group data by Year-Month
  const groupedData = parkData.reduce(
    (acc, item) => {
      const key = `${item.Year}-${String(item.Month).padStart(2, "0")}`;
      if (!acc[key]) {
        acc[key] = {
          RecreationVisits: 0,
          NonRecreationVisits: 0,
        };
      }
      acc[key].RecreationVisits += item.RecreationVisits;
      acc[key].NonRecreationVisits += item.NonRecreationVisits;
      return acc;
    },
    {} as Record<string, { RecreationVisits: number; NonRecreationVisits: number }>
  );

  // Prepare labels and values for the chart
  const yearMonthLabels = Object.keys(groupedData).sort();
  const recreationVisits = yearMonthLabels.map((key) => groupedData[key].RecreationVisits);
  const nonRecreationVisits = yearMonthLabels.map((key) => groupedData[key].NonRecreationVisits);

  // Define the default view window for 10 years
  const totalPoints = yearMonthLabels.length;
  const monthsPerYear = 12;
  const yearsToShow = 10;
  const windowSize = yearsToShow * monthsPerYear;
  const start = 0;
  const end = Math.min((windowSize / totalPoints) * 100, 100);

  // Define ECharts configuration
  const option = {
    title: {
      text: "Monthly Visits Across Parks",
      subtext: "Aggregated by Year-Month",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow", // Better visualization for stacked lines
      },
      formatter: (params: any) => {
        const recreation =
          params.find((p: any) => p.seriesName === "Recreation Visits")?.value || 0;
        const nonRecreation =
          params.find((p: any) => p.seriesName === "Non-Recreation Visits")?.value || 0;
        const total = recreation + nonRecreation;
        return `
          <strong>${params[0].axisValueLabel}</strong><br/>
          Recreation Visits: ${recreation.toLocaleString()}<br/>
          Non-Recreation Visits: ${nonRecreation.toLocaleString()}<br/>
          <strong>Total: ${total.toLocaleString()}</strong>
        `;
      },
    },
    legend: {
      data: ["Recreation Visits", "Non-Recreation Visits"],
      top: "10%",
    },
    grid: {
      top: "20%",
      bottom: "10%",
      left: "10%",
      right: "10%",
    },
    xAxis: {
      type: "category",
      data: yearMonthLabels,
      name: "Year-Month",
      axisLabel: {
        rotate: 45, // Rotate labels for better readability
      },
    },
    yAxis: {
      type: "value",
      name: "Number of Visitors",
    },
    series: [
      {
        name: "Non-Recreation Visits",
        type: "line",
        stack: "total",
        areaStyle: {},
        data: nonRecreationVisits,
        itemStyle: {
          color: "#d87c7c",
        },
      },
      {
        name: "Recreation Visits",
        type: "line",
        stack: "total",
        areaStyle: {},
        data: recreationVisits,
        itemStyle: {
          color: "#919e8b",
        },
      },
    ],
    dataZoom: [
      {
        type: "slider",
        start: start,
        end: end,
        bottom: 0,
      },
      {
        type: "inside",
        start: start,
        end: end,
      },
    ],
  };

  // Initialize the chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption(option);
    }
  };

  // Clean up chart on component destroy
  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });

  // Mount lifecycle to initialize the chart
  onMount(() => {
    initializeChart();
  });
</script>

<div id="chart" bind:this={chartContainer}></div>

<style>
  #chart {
    width: 100%; /* Use full width of container */
    height: 100%; /* Use full height of container */
  }
</style>
