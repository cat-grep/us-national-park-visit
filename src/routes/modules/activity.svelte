<script lang="ts">
  // Import ECharts core and required components
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

  // Import dataset and images
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";
  import tent from "../../data/tent.png";
  import rv from "../../data/rv.png";
  import deer from "../../data/deer.png";

  // Import Svelte lifecycle hooks
  import { onMount, onDestroy } from "svelte";

  // Map series names to corresponding images for end labels
  const imgSets: Record<string, string> = {
    "Tent Campers": tent,
    "RV Campers": rv,
    "Backcountry": deer,
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

  let chart: echarts.ECharts | null = null; // ECharts instance
  let chartContainer: HTMLDivElement | null = null; // Reference to chart container

  // Group data by year and aggregate values
  const groupedByYear = parkData.reduce(
    (acc, item) => {
      const key = `${item.Year}`;
      if (!acc[key]) {
        acc[key] = {
          RecreationVisits: 0,
          NonRecreationVisits: 0,
          TentCampers: 0,
          RVCampers: 0,
          Backcountry: 0,
        };
      }
      acc[key].RecreationVisits += item.RecreationVisits;
      acc[key].NonRecreationVisits += item.NonRecreationVisits;
      acc[key].TentCampers += item.TentCampers;
      acc[key].RVCampers += item.RVCampers;
      acc[key].Backcountry += item.Backcountry;
      return acc;
    },
    {} as Record<
      string,
      {
        RecreationVisits: number;
        NonRecreationVisits: number;
        TentCampers: number;
        RVCampers: number;
        Backcountry: number;
      }
    >
  );

  // Extract sorted year labels and aggregated data series
  const yearLabels = Object.keys(groupedByYear).sort((a, b) => +a - +b);
  const recreationVisits = yearLabels.map(
    (key) => groupedByYear[key].RecreationVisits
  );
  const TentCampers = yearLabels.map((key) => groupedByYear[key].TentCampers);
  const RVCampers = yearLabels.map((key) => groupedByYear[key].RVCampers);
  const Backcountry = yearLabels.map((key) => groupedByYear[key].Backcountry);

  // Configure ECharts options
  const option = {
    animationDuration: 5000, // Set animation duration
    title: {
      text: "Tent Campers vs. RV Campers vs. Backcountry",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: any) => {
        const tentCampers =
          params.find((p: any) => p.seriesName === "Tent Campers")?.value || 0;
        const rvCampers =
          params.find((p: any) => p.seriesName === "RV Campers")?.value || 0;
        const backcountry =
          params.find((p: any) => p.seriesName === "Backcountry")?.value || 0;
        return `<strong>${params[0].axisValueLabel}</strong><br/>
                  Tent Campers: ${tentCampers.toLocaleString()}<br/>
                  RV Campers: ${rvCampers.toLocaleString()}<br/>
                  Backcountry: ${backcountry.toLocaleString()}<br/>
                `;
      },
    },
    xAxis: {
      type: "category",
      data: yearLabels,
      name: "Year",
      nameGap: 50,
      nameLocation: "middle",
      axisLabel: {
        rotate: 45, // Rotate labels for better readability
      },
      axisTick: {
        alignWithLabel: true, // Align ticks with labels
      },
      splitLine: {
        show: true, // Optional grid lines for clarity
      },
    },
    yAxis: {
      type: "value",
      name: "Visits",
      nameGap: 80,
      nameLocation: "middle",
    },
    series: [
      // Tent Campers series
      {
        name: "Tent Campers",
        type: "line",
        data: TentCampers,
        itemStyle: {
          color: "#919e8b",
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const formattedValue = params.value.toLocaleString();
            return `{img| }\n${params.seriesName}\n${formattedValue}`;
          },
          rich: {
            img: {
              backgroundColor: { image: imgSets["Tent Campers"] },
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
      // RV Campers series
      {
        name: "RV Campers",
        type: "line",
        data: RVCampers,
        itemStyle: {
          color: "#d7ab82",
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const formattedValue = params.value.toLocaleString();
            return `{img| }\n${params.seriesName}\n${formattedValue}`;
          },
          rich: {
            img: {
              backgroundColor: { image: imgSets["RV Campers"] },
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
      // Backcountry series
      {
        name: "Backcountry",
        type: "line",
        data: Backcountry,
        itemStyle: {
          color: "#6e7074",
        },
        endLabel: {
          show: true,
          formatter: (params: any) => {
            const formattedValue = params.value.toLocaleString();
            return `{img| }\n${params.seriesName}\n${formattedValue}`;
          },
          rich: {
            img: {
              backgroundColor: { image: imgSets["Backcountry"] },
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

  // Initialize and configure the chart
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer);
      chart.setOption(option);
    }
  };

  // Initialize chart on mount and add resize listener
  onMount(() => {
    initializeChart();
    window.addEventListener("resize", () => chart?.resize());
  });

  // Dispose of chart on destroy
  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
  });
</script>

<div id="chart" bind:this={chartContainer}></div>

<style>
  #chart {
    width: 100%;
    height: 100%;
  }
</style>
