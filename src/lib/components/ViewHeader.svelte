<script lang="ts">
  // Page heading + "how to read" line + chart/table toggle + optional controls.
  import type { Snippet } from "svelte";
  import Icon from "./Icon.svelte";
  import { app, VIEWS } from "$lib/state.svelte";

  let { tableToggle = true, controls }: { tableToggle?: boolean; controls?: Snippet } = $props();

  const def = $derived(VIEWS.find((v) => v.id === app.view)!);
</script>

<header class="view-header">
  <div class="heading">
    <div>
      <h1>{def.title}</h1>
      <p class="how">{def.description}</p>
    </div>
    {#if tableToggle}
      <div class="toggle" role="group" aria-label="Display as">
        <button class:on={!app.showTable} aria-pressed={!app.showTable} onclick={() => (app.showTable = false)}>
          <Icon name="chart" size={16} /> Chart
        </button>
        <button class:on={app.showTable} aria-pressed={app.showTable} onclick={() => (app.showTable = true)}>
          <Icon name="table" size={16} /> Table
        </button>
      </div>
    {/if}
  </div>
  {#if controls}
    <div class="controls">{@render controls()}</div>
  {/if}
</header>

<style>
  .view-header {
    margin-bottom: 1rem;
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
  }

  .how {
    margin: 0;
    color: var(--fg-2);
    max-width: 70ch;
  }

  .toggle {
    display: inline-flex;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    flex: none;
  }

  .toggle button {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 0;
    background: transparent;
    color: var(--fg-2);
    padding: 0.35rem 0.75rem;
  }

  .toggle button.on {
    background: var(--accent);
    color: #fff;
  }

  .controls {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    align-items: center;
  }
</style>
