<script lang="ts">
  // Import ECharts core modules and required components
  import * as echarts from "echarts/core";
  import {
    TooltipComponent,
    TitleComponent,
    GridComponent,
    VisualMapComponent,
  } from "echarts/components";
  import { ScatterChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";

  // Register ECharts components
  echarts.use([
    TooltipComponent,
    TitleComponent,
    GridComponent,
    VisualMapComponent,
    ScatterChart,
    CanvasRenderer,
  ]);

  // Import JSON data and Svelte lifecycle hooks
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";
  import { onMount, onDestroy } from "svelte";

  let chartContainer: HTMLDivElement | null = null; // Reference for chart container
  let chart: echarts.ECharts | null = null; // ECharts instance

  // Reverse order of months for better representation
  const months = [
    "Dec",
    "Nov",
    "Oct",
    "Sep",
    "Aug",
    "Jul",
    "Jun",
    "May",
    "Apr",
    "Mar",
    "Feb",
    "Jan",
  ];

  // Extract unique years from the dataset
  const years = [...new Set(parkData.map((d) => d.Year))].sort((a, b) => a - b);

  // Aggregate data into [YearIndex, MonthIndex, RecreationVisits]
  const aggregatedData = parkData.reduce((acc, item) => {
    const yearIndex = years.indexOf(item.Year);
    const monthIndex = item.Month - 1; // Adjust for zero-based indexing
    const visits = item.RecreationVisits;

    if (!acc[yearIndex]) {
      acc[yearIndex] = [];
    }

    acc[yearIndex][monthIndex] = (acc[yearIndex][monthIndex] || 0) + visits;

    return acc;
  }, []);

  // Transform aggregated data into a flat array for ECharts
  const data = [];
  aggregatedData.forEach((yearData, yearIndex) => {
    if (yearData) {
      yearData.forEach((visits, monthIndex) => {
        if (visits) {
          data.push([yearIndex, monthIndex, visits]);
        }
      });
    }
  });

  // Define ECharts configuration
  const option = {
    tooltip: {
      position: "top",
      formatter: (params) => {
        const year = years[params.data[0]];
        const month = months[params.data[1]];
        const visits = new Intl.NumberFormat("en-US").format(params.data[2]);
        return `<b>${year} ${month}</b><br>Recreation Visits: ${visits}`;
      },
    },
    title: {
      text: "Monthly Recreation Visits to National Parks Over the Years",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: years,
      name: "Year",
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        rotate: 45, // Rotate labels for better readability
      },
    },
    yAxis: {
      type: "category",
      data: months,
      name: "Month",
      nameLocation: "middle",
      nameGap: 50,
      inverse: false, // January appears at the top
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map((d) => d[2])),
      calculable: true,
      orient: "vertical",
      left: "right",
      top: "middle",
      itemHeight: 600,
    },
    series: [
      {
        type: "scatter",
        data: data,
        symbolSize: (value) => Math.sqrt(value[2]) / 100, // Scale point size
        emphasis: {
          label: {
            show: true,
            formatter: (params) =>
              new Intl.NumberFormat("en-US").format(params.data[2]),
            position: "top",
          },
        },
      },
    ],
  };

  // Initialize and render the chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer); // Initialize ECharts instance
      chart.setOption(option); // Apply configuration
    }
  };

  // Mount and cleanup hooks
  onMount(() => {
    initializeChart(); // Render the chart
    window.addEventListener("resize", () => chart?.resize()); // Handle resizing
  });

  onDestroy(() => {
    if (chart) {
      chart.dispose(); // Dispose of chart instance
    }
  });
</script>

<div id="chart-container" bind:this={chartContainer}></div>

<style>
  #chart-container {
    width: 100%;
    height: 100%; /* Ensure full utilization of the container */
  }
</style>
