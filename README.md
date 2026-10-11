# Interactive Explorer: U.S. National Park Visitation Trends (1979-2023)

A data visualization web application designed to present 44 years (1979–2023) of U.S. National Park visitation data. This tool combines interactive visualizations—including charts, maps, and rankings—to provide a comprehensive analysis of trends and patterns.

**<u>Key Features</u>:**  
* **National Park Rankings Over Time:** A longitudinal analysis of how visitation rankings among parks have evolved over the decades.  
* **Annual Trends in Visits:** Insights into long-term patterns and fluctuations in visitation across all parks.  
* **Park, State, and Regional Data:** Tailored visualizations that emphasize geographical differences and trends.  
* **Monthly Patterns:** Scatter plots highlighting seasonal visitation dynamics and peak times.  
* **Purpose-Based Analysis:** A comparative view of recreation versus non-recreation visits.  
* **Camping and Backcountry Activities:** Exploration of trends in overnight stays and wilderness usage.  

The design prioritizes clarity and interactivity, ensuring all visualizations are accessible and user-friendly. This allows for seamless exploration of complex data, making it intuitive to uncover insights into visitation trends across the decades.

[**Live Demo✨**](https://cat-grep.github.io/us-national-park-visit/)

## Development

```sh
pnpm install
pnpm dev      # pre-aggregates the data, then starts the dev server
pnpm build    # static site in build/
pnpm check    # type check
```

`scripts/build-data.mjs` turns the raw monthly dataset in `src/data/` into small JSON files in `static/data/` (generated, not committed), so the raw 13 MB file is never bundled.

## Motivation

![alt text](image.png)
* [Big Ten Academic Alliance 2025 Data Viz Championship](https://btaa.org/research/love-data-week/compete-in-the-2025-data-viz-championship)

## Resources

### Framework and Libraries

* [Svelte](https://svelte.dev/)
* [Apache ECharts](https://echarts.apache.org/index.html)
* [D3](https://d3js.org/) (maps and detail charts)
* [us-atlas](https://github.com/topojson/us-atlas) (state boundaries, from the U.S. Census Bureau)

### Datasets

* [U.S. National Park Visit Data (1979-2023)](https://www.responsible-datasets-in-context.com/posts/np-data/?tab=data-essay)
* [Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html)

### Inspirations 

* [Tidy Tuesday Week 5](https://www.tidytuesday.com/5)
* [FiveThirtyEight: The National Parks' Popularity](https://fivethirtyeight.com/features/the-national-parks-have-never-been-more-popular/)

### Icons and Images

* [National Park Region](https://www.nps.gov/subjects/nationalhistoriclandmarks/contactus.htm)
* [Flaticon-RV](https://www.flaticon.com/free-icon/rv_7058351?term=rv+camp&page=1&position=7&origin=search&related_id=7058351)
* [Flaticon-Deer](https://www.flaticon.com/free-icon/deer_1063448?term=wild&related_id=1063448)
* [Flaticon-Tent](https://www.flaticon.com/free-icon/camping-tent_1600667?term=tent&page=1&position=1&origin=search&related_id=1600667)
* [Flaticon-Tool&Helmet](https://www.flaticon.com/free-icon/safety_2767757?term=tool+helmet&page=1&position=42&origin=search&related_id=2767757)
* [Flaticon-Beach](https://www.flaticon.com/free-icon/beach-chair_669969?term=beach&page=1&position=40&origin=search&related_id=669969)
  
## Contact

**Eugenie Huang**  
Master’s Student in Cartography & Geographic Information Systems  
University of Wisconsin–Madison  
huang674@wisc.edu  
