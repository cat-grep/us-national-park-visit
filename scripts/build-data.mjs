// Pre-aggregates the raw monthly dataset (~13 MB) into small JSON files
// served from static/data/, so the app never bundles the raw file.
//
// Usage: node scripts/build-data.mjs   (runs automatically before dev/build)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(root, "src/data/US-National-Parks_Use_1979-2023_By-Month_Location_Date.json");
const OUT = join(root, "static/data");

const raw = JSON.parse(readFileSync(RAW, "utf8"));
mkdirSync(OUT, { recursive: true });

// --- parks.json: one row per park --------------------------------------
const parks = new Map();
for (const r of raw) {
  const p = parks.get(r.UnitCode);
  if (!p) {
    parks.set(r.UnitCode, {
      code: r.UnitCode,
      name: r.ParkName,
      state: r.State,
      region: r.Region.trim(),
      lon: r.longitude,
      lat: r.latitude,
      firstYear: r.Year,
    });
  } else if (r.Year < p.firstYear) {
    p.firstYear = r.Year;
  }
}

// --- park-year.json: one row per park per year --------------------------
const parkYear = new Map();
for (const r of raw) {
  const key = `${r.UnitCode}|${r.Year}`;
  let row = parkYear.get(key);
  if (!row) {
    row = { code: r.UnitCode, year: r.Year, rec: 0, non: 0, tent: 0, rv: 0, bc: 0, rank: 0 };
    parkYear.set(key, row);
  }
  row.rec += r.RecreationVisits;
  row.non += r.NonRecreationVisits;
  row.tent += r.TentCampers;
  row.rv += r.RVCampers;
  row.bc += r.Backcountry;
}

// Rank parks within each year by total visits (recreation + non-recreation),
// matching the definition used by the original ranked dataset.
const byYear = new Map();
for (const row of parkYear.values()) {
  if (!byYear.has(row.year)) byYear.set(row.year, []);
  byYear.get(row.year).push(row);
}
for (const rows of byYear.values()) {
  rows.sort((a, b) => b.rec + b.non - (a.rec + a.non));
  rows.forEach((row, i) => (row.rank = i + 1));
}

// --- month-totals.json: all parks combined, per year-month --------------
const monthTotals = new Map();
for (const r of raw) {
  const key = r.Year * 100 + r.Month;
  let row = monthTotals.get(key);
  if (!row) {
    row = { year: r.Year, month: r.Month, rec: 0, non: 0, tent: 0, rv: 0, bc: 0 };
    monthTotals.set(key, row);
  }
  row.rec += r.RecreationVisits;
  row.non += r.NonRecreationVisits;
  row.tent += r.TentCampers;
  row.rv += r.RVCampers;
  row.bc += r.Backcountry;
}

const write = (name, data) => {
  const json = JSON.stringify(data);
  writeFileSync(join(OUT, name), json);
  console.log(`  ${name.padEnd(18)} ${(json.length / 1024).toFixed(1)} KB`);
};

console.log("build-data: writing static/data/");
write("parks.json", [...parks.values()].sort((a, b) => a.name.localeCompare(b.name)));
write("park-year.json", [...parkYear.values()].sort((a, b) => a.year - b.year || a.rank - b.rank));
write("month-totals.json", [...monthTotals.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v));
