<script lang="ts">
  import ViewHeader from "$lib/components/ViewHeader.svelte";
  import type { Dataset } from "$lib/data";

  // Receives the shared dataset like every view, but doesn't need it.
  let {}: { data: Dataset } = $props();
</script>

<ViewHeader tableToggle={false} />

<div class="info">
  <section class="card">
    <p>
      Explore U.S. National Park visitation trends from 1979 to 2023. Delve into annual and monthly recreation visit
      data across parks, regions, and states using dynamic charts and maps. Analyze park rankings over time, compare
      recreation versus non-recreation visits, and uncover trends in camping and backcountry activities.
    </p>
    <p>
      Selections are shared between views: pick a year or a park in one view and the others follow. The address bar
      keeps the current view, year and park, so any state can be bookmarked or shared.
    </p>
  </section>

  <section class="card">
    <h2>Data notes</h2>
    <ul>
      <li><b>Rank</b> is based on total visits (recreation + non-recreation) within each year.</li>
      <li>
        Some units became national parks during the period (e.g. Gateway Arch in 2018, New River Gorge in 2020).
        Their earlier visits were recorded under their previous status and are included.
      </li>
      <li>A few parks start reporting after 1979 (e.g. National Park of American Samoa from 2002).</li>
      <li>
        Parks spanning several states (Great Smoky Mountains, Yellowstone, Death Valley) are attributed to a single
        state in the source data, which affects the state map.
      </li>
      <li>
        American Samoa and the U.S. Virgin Islands are shown as insets in the maps, framed on the islands containing
        the parks.
      </li>
    </ul>
  </section>

  <section class="card">
    <h2>Motivation</h2>
    <p>
      <a href="https://btaa.org/research/love-data-week/compete-in-the-2025-data-viz-championship" target="_blank" rel="noopener">
        Big Ten Academic Alliance 2025 Data Viz Championship
      </a>
    </p>
  </section>

  <section class="card">
    <h2>Resources</h2>
    <h3>Framework and libraries</h3>
    <ul>
      <li><a href="https://svelte.dev/" target="_blank" rel="noopener">Svelte</a></li>
      <li><a href="https://echarts.apache.org/" target="_blank" rel="noopener">Apache ECharts</a></li>
      <li><a href="https://d3js.org/" target="_blank" rel="noopener">D3</a> (maps and detail charts)</li>
      <li><a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a> (state boundaries, from the U.S. Census Bureau)</li>
    </ul>

    <h3>Datasets</h3>
    <ul>
      <li>
        <a href="https://www.responsible-datasets-in-context.com/posts/np-data/?tab=data-essay" target="_blank" rel="noopener">
          U.S. National Park Visit Data (1979–2023)
        </a>
      </li>
      <li>
        <a href="https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html" target="_blank" rel="noopener">
          Cartographic Boundary Files
        </a>
      </li>
    </ul>

    <h3>Inspirations</h3>
    <ul>
      <li><a href="https://www.tidytuesday.com/5" target="_blank" rel="noopener">Tidy Tuesday Week 5</a></li>
      <li>
        <a href="https://fivethirtyeight.com/features/the-national-parks-have-never-been-more-popular/" target="_blank" rel="noopener">
          FiveThirtyEight: The National Parks' Popularity
        </a>
      </li>
    </ul>

    <h3>Icons and images</h3>
    <ul>
      <li><a href="https://www.nps.gov/subjects/nationalhistoriclandmarks/contactus.htm" target="_blank" rel="noopener">National Park Region</a></li>
      <li><a href="https://www.flaticon.com/free-icon/rv_7058351" target="_blank" rel="noopener">Flaticon – RV</a></li>
      <li><a href="https://www.flaticon.com/free-icon/deer_1063448" target="_blank" rel="noopener">Flaticon – Deer</a></li>
      <li><a href="https://www.flaticon.com/free-icon/camping-tent_1600667" target="_blank" rel="noopener">Flaticon – Tent</a></li>
      <li><a href="https://www.flaticon.com/free-icon/safety_2767757" target="_blank" rel="noopener">Flaticon – Tool &amp; Helmet</a></li>
      <li><a href="https://www.flaticon.com/free-icon/beach-chair_669969" target="_blank" rel="noopener">Flaticon – Beach</a></li>
    </ul>
  </section>

  <section class="card">
    <h2>Contact</h2>
    <p class="contact">
      Eugenie Huang<br />
      Master’s Student in Cartography &amp; Geographic Information Systems<br />
      University of Wisconsin–Madison<br />
      <a href="mailto:huang674@wisc.edu">huang674@wisc.edu</a>
    </p>
  </section>
</div>

<style>
  .info {
    display: grid;
    gap: 1rem;
    max-width: 75ch;
  }

  h2 {
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  h3 {
    font-size: 0.95rem;
    margin: 1rem 0 0.25rem;
  }

  p {
    margin: 0 0 0.5rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
    list-style: disc;
  }

  li {
    margin: 0.2rem 0;
  }

  .contact {
    font-style: italic;
  }
</style>
