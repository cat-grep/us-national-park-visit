<script lang="ts">
  // Shared year control: range input (arrow keys work natively), play/pause,
  // and a large readout of the current year. Bound to the global year.
  import { onDestroy } from "svelte";
  import Icon from "./Icon.svelte";
  import { app, MIN_YEAR, MAX_YEAR } from "$lib/state.svelte";

  let { min = MIN_YEAR, max = MAX_YEAR }: { min?: number; max?: number } = $props();

  let timer: ReturnType<typeof setInterval> | undefined;
  let playing = $state(false);

  function stop() {
    clearInterval(timer);
    timer = undefined;
    playing = false;
  }

  function play() {
    if (app.year >= max) app.year = min; // restart from the beginning
    playing = true;
    timer = setInterval(() => {
      if (app.year >= max) stop();
      else app.year += 1;
    }, 900);
  }

  onDestroy(stop);
</script>

<div class="year-slider">
  <button
    class="play"
    onclick={() => (playing ? stop() : play())}
    aria-label={playing ? "Pause animation" : "Play through years"}
  >
    <Icon name={playing ? "pause" : "play"} size={16} />
  </button>
  <output class="year" for="year-range" aria-live="off">{app.year}</output>
  <div class="track">
    <input
      id="year-range"
      type="range"
      {min}
      {max}
      step="1"
      bind:value={app.year}
      oninput={stop}
      aria-label="Year"
    />
    <div class="ticks" aria-hidden="true">
      <span>{min}</span>
      <span>{Math.round((min + max) / 2)}</span>
      <span>{max}</span>
    </div>
  </div>
</div>

<style>
  .year-slider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .play {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
  }

  .year {
    font-size: 1.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--fg-1);
    min-width: 4ch;
  }

  .track {
    flex: 1;
    min-width: 0;
  }

  input[type="range"] {
    width: 100%;
    padding: 0;
    accent-color: var(--accent);
    background: transparent;
  }

  .ticks {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--fg-3);
  }
</style>
