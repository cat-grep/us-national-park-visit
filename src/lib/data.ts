// Loads the pre-aggregated files produced by scripts/build-data.mjs and
// builds the indexes every view shares. Fetched once, then cached.

import { base } from "$app/paths";

export interface Park {
  code: string;
  name: string;
  state: string;
  region: string;
  lon: number;
  lat: number;
  firstYear: number;
}

export interface ParkYear {
  code: string;
  year: number;
  rec: number;
  non: number;
  tent: number;
  rv: number;
  bc: number;
  rank: number;
}

export interface MonthTotal {
  year: number;
  month: number;
  rec: number;
  non: number;
  tent: number;
  rv: number;
  bc: number;
}

export type YearTotal = Omit<MonthTotal, "month"> & { parks: number };

export interface Dataset {
  parks: Park[];
  parkYear: ParkYear[];
  months: MonthTotal[];
  years: number[];
  regions: string[];
  parkByCode: Map<string, Park>;
  byYear: Map<number, ParkYear[]>; // sorted by rank
  byPark: Map<string, ParkYear[]>; // sorted by year
  yearTotals: YearTotal[];
}

export interface GroupYear {
  key: string;
  year: number;
  rec: number;
  parks: number;
}

let cache: Promise<Dataset> | null = null;

async function getJson<T>(name: string): Promise<T> {
  const res = await fetch(`${base}/data/${name}`);
  if (!res.ok) throw new Error(`Failed to load ${name} (${res.status})`);
  return res.json();
}

export function loadData(): Promise<Dataset> {
  cache ??= Promise.all([
    getJson<Park[]>("parks.json"),
    getJson<ParkYear[]>("park-year.json"),
    getJson<MonthTotal[]>("month-totals.json"),
  ])
    .then(([parks, parkYear, months]) => buildDataset(parks, parkYear, months))
    .catch((err) => {
      cache = null; // allow retry
      throw err;
    });
  return cache;
}

function buildDataset(parks: Park[], parkYear: ParkYear[], months: MonthTotal[]): Dataset {
  const parkByCode = new Map(parks.map((p) => [p.code, p]));
  const byYear = new Map<number, ParkYear[]>();
  const byPark = new Map<string, ParkYear[]>();
  for (const row of parkYear) {
    if (!byYear.has(row.year)) byYear.set(row.year, []);
    byYear.get(row.year)!.push(row);
    if (!byPark.has(row.code)) byPark.set(row.code, []);
    byPark.get(row.code)!.push(row);
  }
  for (const rows of byYear.values()) rows.sort((a, b) => a.rank - b.rank);
  for (const rows of byPark.values()) rows.sort((a, b) => a.year - b.year);

  const years = [...byYear.keys()].sort((a, b) => a - b);
  const yearTotals = years.map((year) => {
    const t: YearTotal = { year, rec: 0, non: 0, tent: 0, rv: 0, bc: 0, parks: 0 };
    for (const r of byYear.get(year)!) {
      t.rec += r.rec;
      t.non += r.non;
      t.tent += r.tent;
      t.rv += r.rv;
      t.bc += r.bc;
      t.parks++;
    }
    return t;
  });

  const regions = [...new Set(parks.map((p) => p.region))].sort();
  return { parks, parkYear, months, years, regions, parkByCode, byYear, byPark, yearTotals };
}

/** Recreation visits summed by a park attribute (state or region) per year. */
export function groupByYear(data: Dataset, attr: "state" | "region"): Map<string, GroupYear[]> {
  const out = new Map<string, Map<number, GroupYear>>();
  for (const r of data.parkYear) {
    const key = data.parkByCode.get(r.code)![attr];
    if (!out.has(key)) out.set(key, new Map());
    const m = out.get(key)!;
    if (!m.has(r.year)) m.set(r.year, { key, year: r.year, rec: 0, parks: 0 });
    const g = m.get(r.year)!;
    g.rec += r.rec;
    g.parks++;
  }
  return new Map([...out].map(([k, m]) => [k, [...m.values()].sort((a, b) => a.year - b.year)]));
}
