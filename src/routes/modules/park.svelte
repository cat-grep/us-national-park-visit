<script lang="ts">
  // Import ArcGIS map components
  import "@arcgis/map-components/dist/components/arcgis-map";
  import "@arcgis/map-components/dist/components/arcgis-legend";
  import "@arcgis/map-components/dist/components/arcgis-time-slider";
  import "@arcgis/map-components/dist/components/arcgis-zoom";
  import "@arcgis/map-components/dist/components/arcgis-expand";

  // Import FeatureLayer and ArcGIS map types
  import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
  import type { ArcgisMapCustomEvent } from "@arcgis/map-components";
  import type { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";

  // Import optional ArcGIS Charts components
  import "@arcgis/charts-components/dist/components/arcgis-charts-line-chart";
  import "@arcgis/charts-components/dist/components/arcgis-charts-action-bar";

  // Function to set up the map and configure its layers and tools
  function setupMap(event: ArcgisMapCustomEvent<ArcgisMap>) {
    // Query references for time slider and line chart components
    const timeSliderElement = document.querySelector("arcgis-time-slider");
    const linechartElement = document.querySelector("arcgis-charts-line-chart");

    // Extract the map and view from the event
    const { map, view } = event.target;

    // Add a feature layer to the map
    const layer = new FeatureLayer({
      url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/US_National_Parks_RecreationVisits_1979_2023_Location_Date/FeatureServer/0",
      visible: false, // Initially set to hidden
    });
    view.map.add(layer);

    // Configure the time slider once the layer is ready
    view.whenLayerView(layer).then(() => {
      const startDate = new Date(layer.timeInfo.fullTimeExtent.start);
      const endDate = new Date(layer.timeInfo.fullTimeExtent.end);

      // Adjust the start and end dates for the full year
      startDate.setMonth(0, 1); // Start of the year
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31); // End of the year
      endDate.setHours(23, 59, 59, 999);

      // Configure the time slider
      timeSliderElement.fullTimeExtent = { start: startDate, end: endDate };
      timeSliderElement.stops = { interval: { value: 1, unit: "years" } };
      timeSliderElement.timeExtent = {
        start: startDate,
        end: new Date(startDate.getFullYear() + 1, 0, 1),
      };

      // Automatically play the time slider
      timeSliderElement.play();
    });

    // Find the feature layer in the map layers
    const featureLayer = map.layers.find(
      (chartlayer) =>
        chartlayer.title ===
        "US_National_Parks_RecreationVisits_1979_2023_Location_Date"
    );

    if (featureLayer) {
      console.log("Feature Layer found:", featureLayer);
      const linechartConfig = featureLayer.charts[0];
      linechartElement.config = linechartConfig;
      linechartElement.layer = featureLayer;
    } else {
      console.warn("Feature Layer not found.");
    }
  }
</script>

<!-- ArcGIS Map Container -->
<arcgis-map
  item-id="9209443a1ae44432914c19007c1fb34c"
  on:arcgisViewReadyChange={setupMap}
  zoom="4"
  center="-93,38"
>
  <!-- Time Slider -->
  <arcgis-time-slider
    position="bottom-right"
    layout="auto"
    mode="time-window"
    play-rate="1000"
  ></arcgis-time-slider>

  <!-- Expandable Legend -->
  <arcgis-expand
    auto-collapse
    close-on-esc
    position="top-right"
    mode="floating"
    expand-icon="legend"
  >
    <arcgis-legend></arcgis-legend>
  </arcgis-expand>

  <!-- Zoom Control -->
  <arcgis-zoom position="top-left"></arcgis-zoom>
</arcgis-map>
