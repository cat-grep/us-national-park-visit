<script lang="ts">
  import { onMount, type Component } from "svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { app, VIEWS, readUrl, writeUrl, setView, initTheme, toggleTheme, type ViewId } from "$lib/state.svelte";
  import { loadData, type Dataset } from "$lib/data";
  import nationalpark from "../data/nationalpark.png";

  // Views are code-split: each view's chart library code loads on first visit.
  const loaders: Record<ViewId, () => Promise<{ default: Component<{ data: Dataset }> }>> = {
    overview: () => import("./modules/overview.svelte"),
    rank: () => import("./modules/rank.svelte"),
    visits: () => import("./modules/visits.svelte"),
    park: () => import("./modules/park.svelte"),
    state: () => import("./modules/state.svelte"),
    region: () => import("./modules/region.svelte"),
    month: () => import("./modules/month.svelte"),
    purpose: () => import("./modules/purpose.svelte"),
    activity: () => import("./modules/activity.svelte"),
    info: () => import("./modules/info.svelte"),
  };

  let loaded = $state<Partial<Record<ViewId, Component<{ data: Dataset }>>>>({});
  let data = $state<Dataset | null>(null);
  let error = $state<string | null>(null);
  let ready = $state(false);
  let folded = $state(false);
  let main: HTMLElement;

  function fetchData() {
    error = null;
    loadData()
      .then((d) => (data = d))
      .catch((e) => (error = e.message));
  }

  onMount(() => {
    initTheme();
    readUrl();
    ready = true;
    fetchData();
    const onPop = () => readUrl();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  // Mirror state to the URL.
  $effect(() => {
    // Read the tracked fields so the effect re-runs when any of them change.
    void [app.view, app.year, app.park, app.region];
    if (ready) writeUrl();
  });

  // Load the active view's module, and reset scroll on view change.
  $effect(() => {
    const id = app.view;
    if (!loaded[id]) loaders[id]().then((m) => (loaded[id] = m.default));
    main?.scrollTo({ top: 0 });
    // Keep the active tab visible in the scrollable mobile tab bar.
    document.querySelector(".nav-item.active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  const View = $derived(loaded[app.view]);
</script>

<a class="skip" href="#content">Skip to content</a>

<div class="layout">
  <nav class="sidebar" class:folded aria-label="Views">
    <button class="brand" onclick={() => setView("overview")} aria-label="Overview">
      <img src={nationalpark} alt="" class="logo" />
      {#if !folded}
        <span class="title">U.S. National Park Visits <small>1979–2023</small></span>
      {/if}
    </button>

    <ul>
      {#each VIEWS as v (v.id)}
        <li>
          <button
            class="nav-item"
            class:active={app.view === v.id}
            aria-current={app.view === v.id ? "page" : undefined}
            onclick={() => setView(v.id)}
            title={folded ? v.title : undefined}
          >
            <Icon name={v.icon} />
            <span class="label">{v.label}</span>
          </button>
        </li>
      {/each}
    </ul>

    <div class="sidebar-footer">
      <button class="nav-item" onclick={toggleTheme} aria-label={app.dark ? "Switch to light mode" : "Switch to dark mode"}>
        <Icon name={app.dark ? "sun" : "moon"} />
        <span class="label">{app.dark ? "Light" : "Dark"} mode</span>
      </button>
      <button class="nav-item fold" onclick={() => (folded = !folded)} aria-label={folded ? "Expand sidebar" : "Collapse sidebar"}>
        <Icon name={folded ? "right" : "left"} />
        <span class="label">Collapse</span>
      </button>
    </div>
  </nav>

  <main id="content" class="content" bind:this={main}>
    {#if error}
      <div class="status error" role="alert">
        <p>Couldn't load the data: {error}</p>
        <button onclick={fetchData}>Try again</button>
      </div>
    {:else if !data || !View}
      <div class="status" aria-busy="true">
        <div class="skeleton title"></div>
        <div class="skeleton line"></div>
        <div class="skeleton block"></div>
      </div>
    {:else}
      {#key app.view}
        <View {data} />
      {/key}
    {/if}
  </main>
</div>

<style>
  .skip {
    position: absolute;
    left: -999px;
    top: 0;
    z-index: 10;
    background: var(--surface);
    padding: 0.5rem 1rem;
  }

  .skip:focus {
    left: 0.5rem;
  }

  .layout {
    display: flex;
    height: 100dvh;
  }

  /* --- sidebar --- */
  .sidebar {
    flex: none;
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--nav-bg);
    color: var(--nav-fg);
    border: none;
    border-radius: 0;
    overflow-y: auto;
    transition: width 0.2s ease;
  }

  .sidebar.folded {
    width: 64px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: transparent;
    color: inherit;
    padding: 0.25rem;
    text-align: left;
  }

  .brand:hover {
    background: transparent;
  }

  .logo {
    width: 40px;
    height: auto;
    flex: none;
  }

  .title {
    font-weight: 600;
    line-height: 1.2;
    font-size: 0.95rem;
  }

  .title small {
    display: block;
    font-weight: 400;
    opacity: 0.75;
  }

  ul {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.55rem 0.65rem;
    background: transparent;
    color: inherit;
    border-radius: 6px;
    text-align: left;
    font-size: 0.95rem;
    border-left: 3px solid transparent;
  }

  .nav-item:hover {
    background: var(--nav-hover);
  }

  .nav-item.active {
    background: var(--nav-hover);
    border-left-color: var(--nav-accent);
    font-weight: 600;
  }

  .nav-item:focus-visible,
  .brand:focus-visible {
    outline: 2px solid var(--nav-accent);
    outline-offset: 1px;
  }

  .folded .label {
    display: none;
  }

  .folded .nav-item {
    justify-content: center;
    padding: 0.55rem 0;
  }

  .sidebar-footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* --- content --- */
  .content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 1.25rem 1.5rem 2rem;
  }

  .status {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .status.error {
    align-items: flex-start;
  }

  .skeleton {
    border-radius: 6px;
    background: var(--bg-2);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .skeleton.title {
    width: 40%;
    height: 1.75rem;
  }

  .skeleton.line {
    width: 65%;
    height: 1rem;
  }

  .skeleton.block {
    height: 60vh;
  }

  @keyframes pulse {
    50% {
      opacity: 0.5;
    }
  }

  /* --- mobile: sidebar becomes a bottom tab bar --- */
  @media (max-width: 767px) {
    .layout {
      flex-direction: column-reverse;
    }

    .sidebar,
    .sidebar.folded {
      width: auto;
      flex-direction: row;
      align-items: center;
      padding: 0.25rem;
      overflow-x: auto;
      overflow-y: hidden;
    }

    .brand,
    .fold {
      display: none;
    }

    ul,
    .sidebar-footer {
      flex-direction: row;
      margin: 0;
    }

    .nav-item,
    .folded .nav-item {
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.35rem 0.5rem;
      font-size: 0.7rem;
      border-left: none;
      border-top: 3px solid transparent;
      white-space: nowrap;
      justify-content: center;
    }

    .nav-item.active {
      border-top-color: var(--nav-accent);
    }

    .folded .label,
    .label {
      display: inline;
    }

    .content {
      padding: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }

    .sidebar {
      transition: none;
    }
  }
</style>
