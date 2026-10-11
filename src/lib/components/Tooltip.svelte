<script lang="ts">
  // Pointer-following tooltip positioned inside a relatively-positioned
  // container; flips to stay within the container's edges.
  import type { Snippet } from "svelte";

  let {
    x,
    y,
    bounds,
    children,
  }: { x: number; y: number; bounds: { width: number; height: number }; children: Snippet } = $props();

  let w = $state(200);
  let h = $state(80);

  const left = $derived(x + 14 + w > bounds.width ? Math.max(0, x - w - 14) : x + 14);
  const top = $derived(y + 14 + h > bounds.height ? Math.max(0, y - h - 14) : y + 14);
</script>

<div class="tooltip" bind:offsetWidth={w} bind:offsetHeight={h} style:left="{left}px" style:top="{top}px" role="tooltip">
  {@render children()}
</div>

<style>
  .tooltip {
    position: absolute;
    pointer-events: none;
    z-index: 5;
    max-width: 240px;
    padding: 0.5rem 0.65rem;
    background: var(--surface);
    color: var(--fg-1);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-size: 0.85rem;
    line-height: 1.4;
  }
</style>
