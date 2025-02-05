<script lang="ts">
  // Import ECharts modules
  import * as echarts from "echarts/core";
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from "echarts/components";
  import { BarChart } from "echarts/charts";
  import { LineChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";

  // Import JSON data and images
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";
  import holiday from "../../data/holiday.png";
  import construct from "../../data/construct.png";

  // Svelte lifecycle hooks
  import { onMount, onDestroy, tick } from "svelte";

  // Map for associating series names with images
  const imgSets: Record<string, string> = {
    Recreation: holiday,
    "Non-Recreation": construct,
  };

  // Register ECharts components
  echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    BarChart,
    LineChart,
    CanvasRenderer,
  ]);

  let chart: echarts.ECharts | null = null; // Chart instance
  let chartContainer: HTMLDivElement | null = null; // Chart container reference

  // Group data by year
  const groupedByYear = parkData.reduce(
    (acc, item) => {
      const key = `${item.Year}`;
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

  // Extract year labels and data values
  const yearLabels = Object.keys(groupedByYear).sort((a, b) => +a - +b);
  const recreationVisits = yearLabels.map((key) => groupedByYear[key].RecreationVisits);
  const nonRecreationVisits = yearLabels.map((key) => groupedByYear[key].NonRecreationVisits);

  // ECharts configuration
  const option = {
    animationDuration: 5000,
    title: {
      text: "Recreation vs. Non-Recreation Visits",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        let recreation = 0;
        let nonRecreation = 0;

        // Aggregate values from tooltip data
        params.forEach((p: any) => {
          if (p.seriesName === "Recreation") recreation = p.value || 0;
          if (p.seriesName === "Non-Recreation") nonRecreation = p.value || 0;
        });

        const total = recreation + nonRecreation;
        return `
          <strong>${params[0].axisValueLabel}</strong><br/>
          Recreation Visits: ${recreation.toLocaleString()}<br/>
          Non-Recreation Visits: ${nonRecreation.toLocaleString()}<br/>
          <strong>Total: ${total.toLocaleString()}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: yearLabels,
      name: "Year",
      nameGap: 50,
      nameLocation: "middle",
      axisLabel: {
        rotate: 45, // Improve readability
      },
      axisTick: {
        alignWithLabel: true,
      },
      splitLine: {
        show: true, // Optional grid lines for better readability
      },
    },
    yAxis: {
      type: "value",
      name: "Visits",
      nameGap: 80,
      nameLocation: "middle",
    },
    series: [
      {
        name: "Non-Recreation",
        type: "line",
        data: nonRecreationVisits,
        itemStyle: {
          color: "#919e8b",
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const formattedValue = new Intl.NumberFormat("en-US").format(params.value);
            return `{img| }\n${params.seriesName}\n${formattedValue}`;
          },
          rich: {
            img: {
              backgroundColor: {
                image: imgSets["Non-Recreation"], // Non-Recreation image
              },
              height: 50,
              width: 50,
              align: "center",
            },
          },
        },
        labelLayout: {
          moveOverlap: "shiftY",
        },
      },
      {
        name: "Recreation",
        type: "line",
        data: recreationVisits,
        itemStyle: {
          color: "#d7ab82",
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const formattedValue = new Intl.NumberFormat("en-US").format(params.value);
            return `{img| }\n${params.seriesName}\n${formattedValue}`;
          },
          rich: {
            img: {
              backgroundColor: {
                image: imgSets["Recreation"], // Recreation image
              },
              height: 50,
              width: 50,
              align: "center",
            },
          },
        },
        labelLayout: {
          moveOverlap: "shiftY",
        },
      },
    ],
  };

  // Initialize the chart
  const initializeChart = async () => {
    await tick(); // Ensure DOM is ready
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption(option);
    }
  };

  // Mount lifecycle hook
  onMount(() => {
    initializeChart();
    window.addEventListener("resize", () => chart?.resize()); // Responsive handling
  });

  // Cleanup lifecycle hook
  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

<!-- Chart container -->
<div id="chart-container" bind:this={chartContainer}></div>

<style>
  #chart-container {
    width: 100%;
    height: 100%;
  }
</style>
