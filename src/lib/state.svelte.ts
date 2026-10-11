// App-wide state shared by all views (linked selections), mirrored to the URL
// so a view/year/park can be bookmarked, shared, and restored with Back.

import { pushState, replaceState } from "$app/navigation";

export type ViewId =
  | "overview"
  | "rank"
  | "visits"
  | "park"
  | "state"
  | "region"
  | "month"
  | "purpose"
  | "activity"
  | "info";

export interface ViewDef {
  id: ViewId;
  label: string; // short nav label
  title: string; // page heading
  icon: string;
  description: string; // "how to read" line
}

export const VIEWS: ViewDef[] = [
  {
    id: "overview",
    label: "Overview",
    title: "45 Years of National Park Visits",
    icon: "home",
    description: "Headline numbers for all 63 national parks, and where to explore next.",
  },
  {
    id: "rank",
    label: "Rank",
    title: "National Park Rankings Over Time",
    icon: "rank",
    description: "Each line is a park's yearly rank by total visits (1 = most visited). Pick a park to highlight it.",
  },
  {
    id: "visits",
    label: "Visits",
    title: "Annual Visits by Park",
    icon: "bars",
    description: "Recreation and non-recreation visits per park for the selected year, sorted by total.",
  },
  {
    id: "park",
    label: "Park Map",
    title: "Recreation Visits by Park",
    icon: "pin",
    description: "Circle area is proportional to recreation visits in the selected year. Click a park for its full history.",
  },
  {
    id: "state",
    label: "State Map",
    title: "Recreation Visits by State",
    icon: "map",
    description: "States shaded by recreation visits to their national parks (log scale). Click a state for its trend.",
  },
  {
    id: "region",
    label: "Region",
    title: "Recreation Visits by NPS Region",
    icon: "grid",
    description: "Each cell is one region in one year; stronger color means more recreation visits.",
  },
  {
    id: "month",
    label: "Month",
    title: "Seasonality of Recreation Visits",
    icon: "scatter",
    description: "Each dot is one month of one year; size and color both show total recreation visits across all parks.",
  },
  {
    id: "purpose",
    label: "Purpose",
    title: "Recreation vs. Non-Recreation Visits",
    icon: "walk",
    description: "Non-recreation visits include commuters, through-traffic and people working in the park.",
  },
  {
    id: "activity",
    label: "Camping",
    title: "Campers and Backcountry Use",
    icon: "tent",
    description: "Overnight stays per year: tent campers, RV campers and backcountry campers.",
  },
  {
    id: "info",
    label: "About",
    title: "About this Project",
    icon: "info",
    description: "Data sources, method notes and credits.",
  },
];

export const MIN_YEAR = 1979;
export const MAX_YEAR = 2023;
const DEFAULT_VIEW: ViewId = "overview";

class AppState {
  view = $state<ViewId>(DEFAULT_VIEW);
  year = $state(MAX_YEAR);
  park = $state<string | null>(null); // UnitCode
  region = $state<string | null>(null);
  dark = $state(false);
  /** Whether each view shows its chart or the accessible table. */
  showTable = $state(false);
}

export const app = new AppState();

const isView = (v: string | null): v is ViewId => VIEWS.some((d) => d.id === v);

/** Read state from the current URL (on load and on Back/Forward). */
export function readUrl() {
  const q = new URLSearchParams(window.location.search);
  const view = q.get("view");
  app.view = isView(view) ? view : DEFAULT_VIEW;
  const year = Number(q.get("year"));
  app.year = year >= MIN_YEAR && year <= MAX_YEAR ? year : MAX_YEAR;
  app.park = q.get("park");
  app.region = q.get("region");
}

function toUrl() {
  const q = new URLSearchParams();
  if (app.view !== DEFAULT_VIEW) q.set("view", app.view);
  if (app.year !== MAX_YEAR) q.set("year", String(app.year));
  if (app.park) q.set("park", app.park);
  if (app.region) q.set("region", app.region);
  const s = q.toString();
  return window.location.pathname + (s ? `?${s}` : "");
}

/**
 * Keep the URL in sync. A view change adds a history entry (Back works);
 * year/selection changes replace the current one to avoid flooding history.
 * Call from an $effect in the root component.
 */
let lastView: ViewId | null = null;
export function writeUrl() {
  const url = toUrl();
  if (url === window.location.pathname + window.location.search) {
    lastView = app.view;
    return;
  }
  if (lastView !== null && lastView !== app.view) pushState(url, {});
  else replaceState(url, {});
  lastView = app.view;
}

export function setView(view: ViewId) {
  app.view = view;
}

// --- theme -----------------------------------------------------------------
export function initTheme() {
  app.dark = document.documentElement.classList.contains("dark");
}

export function toggleTheme() {
  app.dark = !app.dark;
  document.documentElement.classList.toggle("dark", app.dark);
  try {
    localStorage.setItem("theme", app.dark ? "dark" : "light");
  } catch {
    // storage unavailable (private mode); theme still applies for this visit
  }
}
