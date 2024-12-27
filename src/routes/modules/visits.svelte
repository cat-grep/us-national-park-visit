<script lang="ts">
  // Import ECharts core and required components
  import * as echarts from "echarts/core";
  import {
    GridComponent,
    TitleComponent,
    TooltipComponent,
    DatasetComponent,
  } from "echarts/components";
  import { BarChart } from "echarts/charts";
  import { CanvasRenderer } from "echarts/renderers";

  // Register ECharts components
  echarts.use([
    GridComponent,
    TitleComponent,
    TooltipComponent,
    DatasetComponent,
    BarChart,
    CanvasRenderer,
  ]);

  // Import Svelte lifecycle hooks
  import { onMount, onDestroy } from "svelte";

  // References for chart container and ECharts instance
  let chartContainer: HTMLDivElement | null = null;
  let chart: echarts.ECharts | null = null;

  // Variables for slider and autoplay
  let selectedYear: number = 1979;
  let years: number[] = [];
  let autoPlayInterval: number | undefined;

  // Load and process JSON data
  import parkData from "../../data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json";

  const parks = [...new Set(parkData.map((d) => d.ParkName))];
  years = [...new Set(parkData.map((d) => d.Year))].sort((a, b) => a - b);

  // Function to extract and aggregate data for a specific year
  function getYearData(year: number) {
    return parks
      .map((park) => {
        const parkDataYear = parkData.filter(
          (d) => d.ParkName === park && d.Year === year,
        );
        const recreationVisits = parkDataYear.reduce(
          (sum, item) => sum + item.RecreationVisits,
          0,
        );
        const nonRecreationVisits = parkDataYear.reduce(
          (sum, item) => sum + item.NonRecreationVisits,
          0,
        );
        const totalVisits = recreationVisits + nonRecreationVisits;
        return [park, recreationVisits, nonRecreationVisits, totalVisits];
      })
      .sort((a, b) => b[3] - a[3]); // Sort by total visits
  }

  // Initialize ECharts instance and configure chart options
  const initializeChart = () => {
    if (chartContainer) {
      chart = echarts.init(chartContainer);

      const option = {
        title: {
          text: "Annual Trends in Visits Across National Parks",
          left: "center",
        },
        grid: {
          top: 100,
          bottom: 100,
          left: 200,
          right: 50,
        },
        xAxis: {
          max: "dataMax",
          type: "value",
          name: "Visits",
          nameLocation: "center",
          nameGap: 50,
          axisLabel: {
            rotate: -20, // Improve readability for long labels
          },
        },
        yAxis: {
          type: "category",
          name: "National Park Name",
          inverse: true,
          data: parks,
          nameLocation: "center",
          nameGap: 150,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: any) => {
            return `<strong>${params[0].axisValueLabel}</strong><br/>
              Recreation Visits: ${params[0].value[1].toLocaleString()}<br/>
              Non-Recreation Visits: ${params[0].value[2].toLocaleString()}<br/>
              <strong>Total Visits: ${params[0].value[3].toLocaleString()}</strong>`;
          },
        },
        dataset: {
          source: getYearData(selectedYear),
        },
        legend: {
          data: ["Recreation Visits", "Non-Recreation Visits"],
          top: "30px",
        },
        series: [
          {
            name: "Recreation Visits",
            type: "bar",
            stack: "Total",
            encode: {
              x: 1,
              y: 0,
            },
            itemStyle: {
              color: "#d7ab82",
            },
          },
          {
            name: "Non-Recreation Visits",
            type: "bar",
            stack: "Total",
            encode: {
              x: 2,
              y: 0,
            },
            itemStyle: {
              color: "#919e8b",
            },
          },
        ],
      };

      chart.setOption(option);
    }
  };

  // Update chart data based on the selected year
  const updateChart = (year: number) => {
    const newSource = getYearData(year);
    chart?.setOption({
      dataset: {
        source: newSource,
      },
      yAxis: {
        data: newSource.map((d) => d[0]),
      },
    });
  };

  // Handle slider input changes
  const handleSliderChange = (event: Event) => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval); // Stop autoplay when user interacts
    }
    const year = parseInt((event.target as HTMLInputElement).value, 10);
    selectedYear = year;
    updateChart(year);
  };

  // Automatically play through the years
  const autoPlaySlider = () => {
    let yearIndex = years.indexOf(selectedYear);

    autoPlayInterval = setInterval(() => {
      yearIndex++;
      if (yearIndex >= years.length) {
        clearInterval(autoPlayInterval);
        return;
      }
      selectedYear = years[yearIndex];
      updateChart(selectedYear);
    }, 1000); // 1-second interval
  };

  // Mount and clean up lifecycle hooks
  onMount(() => {
    initializeChart();
    autoPlaySlider(); // Start autoplay
    window.addEventListener("resize", () => chart?.resize());
  });

  onDestroy(() => {
    if (chart) {
      chart.dispose();
    }
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  });
</script>

<!-- Slider for year selection -->
<div id="slider-container">
  <label for="year-slider" class="watermark-label">
    Year: {selectedYear}
  </label>
  <input
    class="slider"
    id="year-slider"
    type="range"
    min={Math.min(...years)}
    max={Math.max(...years)}
    value={selectedYear}
    step="1"
    list="year-marks"
    on:input={handleSliderChange}
  />
  <datalist id="year-marks">
    {#each years as year}
      <option value={year}></option>
    {/each}
  </datalist>
</div>

<!-- Chart container -->
<div id="chart-container" bind:this={chartContainer}></div>

<style>
  /* Base Styles */
  #chart-container {
    width: 100%;
    height: 1600px;
  }

  #slider-container {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative; /* For positioning marks */
  }

  input[type="range"] {
    width: 95%;
    /* -webkit-appearance: none; */
    /* background: transparent; */
    position: relative;
  }

  .slider {
    /* -webkit-appearance: none; */
    width: 100%;
    height: 5px; /* Thinner slider */
    background: #d3d3d3;
    border-radius: 5px;
    outline: none;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .slider:hover {
    opacity: 1;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    background: #314656;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: #314656;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  datalist {
    display: flex;
    justify-content: space-between;
    width: 95%;
    margin-top: 10px;
  }

  datalist option {
    position: relative;
    text-align: center;
    font-size: 1rem; /* Smaller font size for marks */
    color: #666;
    flex: 1; /* Spread evenly */
  }

  .watermark-label {
    font-size: 1.2rem; /* Huge font size */
    font-weight: bold; /* Bold text */
    color: rgba(50, 50, 50, 0.3); /* Light gray with transparency */
    pointer-events: none; /* Allow interactions to pass through */
    user-select: none; /* Disable text selection */
    text-align: center;
    margin-bottom: 0.5rem; /* Add space between label and slider */
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .slider {
      height: 3px; /* Thinner slider */
    }

    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      width: 6px; /* Smaller thumb size */
      height: 6px;
    }

    datalist option {
      font-size: 0.6rem; /* Smaller font size for marks */
    }
  }

  @media (max-width: 480px) {
    .slider {
      height: 1px; /* Smaller slider height */
    }

    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      width: 3px; /* Smaller thumb size */
      height: 3px;
    }

    datalist option {
      font-size: 0.3rem; /* Smaller font size for marks */
    }
  }
</style>
