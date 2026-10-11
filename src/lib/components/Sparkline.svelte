<script lang="ts">
  // D3-computed line chart for a single series (park or state history).
  // Marks the selected year; hover shows the value for any year.
  import { scaleLinear } from "d3-scale";
  import { line } from "d3-shape";
  import { max, bisector } from "d3-array";
  import { fmtShort, fmtFull } from "$lib/theme";

  interface Point {
    year: number;
    value: number;
  }

  let {
    points,
    year,
    minYear,
    maxYear,
    color,
    height = 140,
    label,
  }: {
    points: Point[];
    year: number;
    minYear: number;
    maxYear: number;
    color: string;
    height?: number;
    label: string;
  } = $props();

  let width = $state(300);
  let hover = $state<Point | null>(null);
  const m = { top: 12, right: 12, bottom: 22, left: 40 };

  const x = $derived(scaleLinear().domain([minYear, maxYear]).range([m.left, width - m.right]));
  const y = $derived(
    scaleLinear()
      .domain([0, max(points, (d) => d.value) || 1])
      .nice(4)
      .range([height - m.bottom, m.top]),
  );
  const path = $derived(
    line<Point>()
      .x((d) => x(d.year))
      .y((d) => y(d.value))(points) ?? "",
  );
  const current = $derived(points.find((d) => d.year === year));
  const shown = $derived(hover ?? current);
  const bisect = bisector<Point, number>((d) => d.year).center;

  function onMove(e: PointerEvent) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const yr = Math.round(x.invert(e.clientX - rect.left));
    hover = points[bisect(points, yr)] ?? null;
  }
</script>

<figure class="spark" bind:clientWidth={width}>
  <figcaption>
    {label}
    {#if shown}
      <span class="readout"><b>{fmtFull(shown.value)}</b> in {shown.year}</span>
    {/if}
  </figcaption>
  <svg
    {width}
    {height}
    role="img"
    aria-label={`${label}, ${points[0]?.year}–${points.at(-1)?.year}`}
    onpointermove={onMove}
    onpointerleave={() => (hover = null)}
  >
    {#each y.ticks(3) as t}
      <g transform={`translate(0,${y(t)})`}>
        <line x1={m.left} x2={width - m.right} class="grid" />
        <text x={m.left - 6} dy="0.32em" text-anchor="end" class="tick">{fmtShort(t)}</text>
      </g>
    {/each}
    {#each [minYear, Math.round((minYear + maxYear) / 2), maxYear] as t}
      <text x={x(t)} y={height - 6} text-anchor="middle" class="tick">{t}</text>
    {/each}
    <line x1={x(year)} x2={x(year)} y1={m.top} y2={height - m.bottom} class="now" />
    <path d={path} fill="none" stroke={color} stroke-width="2" />
    {#if shown}
      <circle cx={x(shown.year)} cy={y(shown.value)} r="4" fill={color} class="dot" />
    {/if}
  </svg>
</figure>

<style>
  .spark {
    margin: 0;
    width: 100%;
  }

  figcaption {
    font-size: 0.85rem;
    color: var(--fg-2);
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .readout b {
    color: var(--fg-1);
    font-variant-numeric: tabular-nums;
  }

  svg {
    display: block;
    touch-action: pan-y;
  }

  .grid {
    stroke: var(--grid);
  }

  .tick {
    font-size: 10px;
    fill: var(--fg-3);
    font-variant-numeric: tabular-nums;
  }

  .now {
    stroke: var(--fg-3);
    stroke-dasharray: 3 3;
  }

  .dot {
    stroke: var(--surface);
    stroke-width: 2;
  }
</style>
