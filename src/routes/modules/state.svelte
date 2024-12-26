<script lang="ts">
  // Import required ArcGIS components and FeatureLayer module
  import "@arcgis/map-components/dist/components/arcgis-map";
  import "@arcgis/map-components/dist/components/arcgis-legend";
  import "@arcgis/map-components/dist/components/arcgis-time-slider";
  import "@arcgis/map-components/dist/components/arcgis-zoom";
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
  import type { ArcgisMapCustomEvent } from "@arcgis/map-components";
  import type { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";

  // Import optional ArcGIS Charts components
  import "@arcgis/charts-components/dist/components/arcgis-charts-line-chart";
  import "@arcgis/charts-components/dist/components/arcgis-charts-action-bar";

  // Function to initialize and configure the map and its layers
  function setupMap(event: ArcgisMapCustomEvent<ArcgisMap>) {
    const timeSliderElement = document.querySelector("arcgis-time-slider");
    const linechartElement = document.querySelector("arcgis-charts-line-chart");

    const { map, view } = event.target; // Destructure map and view from the event

    // Add a FeatureLayer to the map
    const layer = new FeatureLayer({
      url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/US_National_Parks_Join_byState_Export/FeatureServer",
      visible: false, // Initially hidden
    });

    view.map.add(layer); // Add layer to the map

    // Wait for the layer view to be ready
    view.whenLayerView(layer).then(() => {
      // Set up time slider configuration based on the layer's time extent
      const startDate = new Date(layer.timeInfo.fullTimeExtent.start);
      const endDate = new Date(layer.timeInfo.fullTimeExtent.end);

      // Adjust the start and end dates to cover a full year
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31); // Use last day of the year
      endDate.setHours(23, 59, 59, 999);

      // Configure the time slider's full extent and intervals
      timeSliderElement.fullTimeExtent = {
        start: startDate,
        end: endDate,
      };
      timeSliderElement.stops = {
        interval: { value: 1, unit: "years" },
      };
      timeSliderElement.timeExtent = {
        start: startDate,
        end: new Date(startDate.getFullYear() + 1, 0, 1),
      };

      // Play the time slider
      timeSliderElement.play();
    });

    // Set up line chart configuration if applicable
    const featureLayer = map.layers.find(
      (chartLayer) => chartLayer.title === "cb_2023_us_state_20m_Sum_byState"
    );

    if (featureLayer && featureLayer.charts?.length > 0) {
      const linechartConfig = featureLayer.charts[0];
      linechartElement.config = linechartConfig;
      linechartElement.layer = featureLayer;
    }
  }
</script>

<!-- Map with components: time slider, legend, and zoom controls -->
<arcgis-map
  item-id="b123f787a49946c8b57782658723b948"
  on:arcgisViewReadyChange={setupMap}
  zoom="4"
  center="-93,38"
>
  <arcgis-time-slider
    position="bottom-trailing"
    layout="auto"
    mode="time-window"
    play-rate="1000"
  ></arcgis-time-slider>
  <arcgis-legend position="top-right"></arcgis-legend>
  <arcgis-zoom position="top-left"></arcgis-zoom>
</arcgis-map>
