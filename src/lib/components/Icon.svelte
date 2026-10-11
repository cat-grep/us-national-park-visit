<script lang="ts">
  // Small inline stroke icons, replacing the Calcite icon CDN dependency.
  let { name, size = 18 }: { name: string; size?: number } = $props();

  const paths: Record<string, string> = {
    home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
    rank: "M9 6h11M9 12h11M9 18h11M4 5l1-1v4M3.5 14.5c.5-1 2.5-1 2.5.5S3.5 17 3.5 19H6",
    bars: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    map: "m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6ZM9 4v14M15 6v14",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    scatter: "M3 3v18h18M8 14h.01M12 9h.01M16 13h.01M18 7h.01M10 17h.01",
    walk: "M13 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM10 22l2-7 3 3v4M8 12l2-4 4 1 2 3 3 1M10 8l-1 5",
    tent: "M2 20 12 4l10 16H2ZM12 20l-4-6M12 20l4-6",
    info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5h.01",
    left: "m11 17-5-5 5-5M18 17l-5-5 5-5",
    right: "m13 17 5-5-5-5M6 17l5-5-5-5",
    play: "M7 4v16l13-8L7 4Z",
    pause: "M7 4h3v16H7zM14 4h3v16h-3z",
    moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
    sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    table: "M3 4h18v16H3zM3 10h18M3 15h18M9 4v16",
    chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
    reset: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
    close: "M6 6l12 12M18 6 6 18",
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  class="icon"
>
  <path d={paths[name] ?? ""} />
</svg>

<style>
  .icon {
    flex: none;
  }
</style>
