<script>
  // Importing the Calcite Icon component for sidebar icons
  import { setAssetPath } from "@esri/calcite-components/dist/components";
  // CDN hosted assets
  setAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");
  import "@esri/calcite-components/dist/components/calcite-icon";
  import "@esri/calcite-components/dist/calcite/calcite.css"; // Required for Calcite styles

  // Importing Svelte's lifecycle method
  import { onMount } from "svelte";

  // Importing the different sections/modules for rendering in the main content area
  import Info from "./modules/info.svelte";
  import Rank from "./modules/rank.svelte";
  import Activity from "./modules/activity.svelte";
  import ActivityByMon from "./modules/activity-byMon.svelte";
  import State from "./modules/state.svelte";
  import Park from "./modules/park.svelte";
  import Region from "./modules/region.svelte";
  import Month from "./modules/month.svelte";
  import Visits from "./modules/visits.svelte";
  import Purpose from "./modules/purpose.svelte";
  import PurposeByMon from "./modules/purpose-byMon.svelte";

  // Importing the logo for the sidebar
  import nationalpark from "../data/nationalpark.png";

  // Tracks the currently active section in the main content area
  let activeSection = "rank";

  // Tracks whether the sidebar is in a folded (collapsed) state
  let folded = false;

  // Function to dynamically adjust the sidebar state based on viewport width
  const checkViewportWidth = () => {
    folded = window.innerWidth < 1920; // Fold the sidebar for small screens
  };

  // Add an event listener on component mount to monitor window resize events
  onMount(() => {
    checkViewportWidth(); // Initialize sidebar state based on current viewport width
    window.addEventListener("resize", checkViewportWidth); // Update state on window resize

    // Cleanup event listener when the component is destroyed
    return () => {
      window.removeEventListener("resize", checkViewportWidth);
    };
  });
</script>

<div class="layout">
  <!-- Sidebar navigation -->
  <nav class={`sidebar ${folded ? "folded" : ""}`}>
    <ul>
      <!-- Logo Section -->
      <li>
        <div class="logo-section" on:click={() => (activeSection = "info")}>
          <img
            src={nationalpark}
            alt="National Park Service Logo"
            class="logo"
          />
          {#if !folded}
            <!-- Display title only when sidebar is not folded -->
            <label class="title" for="#"
              >U.S. National Park Visit Data (1979-2023)</label
            >
          {/if}
        </div>
      </li>

      <!-- Navigation Items -->
      <li>
        <button on:click={() => (activeSection = "rank")}>
          <calcite-icon icon="list-number"></calcite-icon>
          {#if !folded}
            National Park Rankings Over Time
          {:else}
            Rank
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "visits")}>
          <calcite-icon icon="graph-bar-stacked"></calcite-icon>
          {#if !folded}
            Annual Trends in Visits Across National Parks
          {:else}
            Visits
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "park")}>
          <calcite-icon icon="analysis"></calcite-icon>
          {#if !folded}
            Annual Recreation Visits to National Parks
          {:else}
            Park
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "state")}>
          <calcite-icon icon="map"></calcite-icon>
          {#if !folded}
            Annual Recreation Visits to National Parks by State
          {:else}
            State
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "region")}>
          <calcite-icon icon="heat-chart"></calcite-icon>
          {#if !folded}
            Annual Recreation Visits to National Parks by Region
          {:else}
            Region
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "month")}>
          <calcite-icon icon="graph-scatter-plot"></calcite-icon>
          {#if !folded}
            Monthly Recreation Visits to National Parks Over the Years
          {:else}
            Month
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "purpose")}>
          <calcite-icon icon="walking"></calcite-icon>
          {#if !folded}
            Recreation vs. Non-Recreation Visits
          {:else}
            Purpose
          {/if}
        </button>
      </li>
      <li>
        <button on:click={() => (activeSection = "activity")}>
          <calcite-icon icon="initiative"></calcite-icon>
          {#if !folded}
            Campers and Backcountry
          {:else}
            Activity
          {/if}
        </button>
      </li>

      <!-- Sidebar Toggle Button -->
      <button class="toggle-button" on:click={() => (folded = !folded)}>
        {#if folded}
          <calcite-icon icon="chevrons-right"></calcite-icon>
        {:else}
          <calcite-icon icon="chevrons-left"></calcite-icon>
        {/if}
      </button>
    </ul>
  </nav>

  <!-- Main content area -->
  <main class="content">
    {#if activeSection === "info"}
      <Info />
    {/if}
    {#if activeSection === "rank"}
      <Rank />
    {/if}
    {#if activeSection === "visits"}
      <Visits />
    {/if}
    {#if activeSection === "park"}
      <Park />
    {/if}
    {#if activeSection === "state"}
      <State />
    {/if}
    {#if activeSection === "region"}
      <Region />
    {/if}
    {#if activeSection === "month"}
      <Month />
    {/if}
    {#if activeSection === "purpose"}
      <Purpose />
    {/if}
    {#if activeSection === "activity"}
      <Activity />
    {/if}
  </main>
</div>

<style>
  .layout {
    display: flex;
    height: 100%;
  }

  .sidebar {
    transition: width 0.3s ease;
    width: 200px;
    min-width: 100px;
    max-width: 200px;
    background-color: #314656;
    border-right: 1px solid #dee2e6;
    overflow-y: auto;
    padding: 1rem;
    position: relative;
  }

  .sidebar.folded {
    width: 60px;
    padding: 0.5rem;
  }

  .sidebar .logo {
    max-width: 100%;
    height: auto;
    margin-bottom: 0.5rem;
  }

  .sidebar .title {
    display: inline-block;
  }

  .sidebar .toggle-button {
    background: #43596b;
    color: #dee2e6;
    border: none;
    cursor: pointer;
    padding: 1rem;
    width: 100%; /* Make it span the full width */
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar .toggle-button:hover {
    background-color: #c23531;
  }

  .sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar li {
    margin-bottom: 1rem;
    cursor: pointer;
    font-size: 1rem;
    color: #dee2e6;
  }

  .sidebar li:hover {
    color: #c23531;
  }

  .sidebar button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 70px;
    padding: 0.5rem;
    background-color: transparent;
    color: #dee2e6;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: left;
    flex-direction: row; /* Default layout for buttons */
  }

  .sidebar button:hover {
    background-color: #43596b;
  }

  .sidebar button calcite-icon {
    margin-right: 1rem;
    width: 20px;
    height: 20px;
  }

  /* .sidebar button span {
    font-size: 0.9rem;
  } */

  .sidebar.folded button {
    flex-direction: column; /* Change layout to column when folded */
    justify-content: center;
    align-items: center;
    height: 70px; /* Adjust height to fit icon and text vertically */
    text-align: center; /* Center align text */
  }

  .sidebar.folded button calcite-icon {
    margin: 0 0 0.5rem; /* Add spacing below the icon */
  }

  /* .sidebar.folded button span {
    font-size: 0.75rem; 
    display: inline; 
  } */

  .content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }
</style>
