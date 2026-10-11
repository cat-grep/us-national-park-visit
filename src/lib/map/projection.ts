// Composite projection for the U.S. including the two territories that have
// national parks. geoAlbersUsa covers the lower 48 + Alaska + Hawaii but
// projects American Samoa and the U.S. Virgin Islands to null, so each gets
// its own Mercator inset in the bottom-right corner.

import { geoAlbersUsa, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiPoint } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

export interface StateFeature extends Feature<Geometry, { name: string }> {
  id: string; // FIPS
}

export type MapArea = "main" | "AS" | "VI";

export interface Inset {
  area: Exclude<MapArea, "main">;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapLayout {
  width: number;
  height: number;
  insets: Inset[];
  /** Project a point; `state` (USPS code) routes territory points to their inset. */
  project(lon: number, lat: number, state: string): [number, number] | null;
  areaOf(state: string): MapArea;
  path(f: StateFeature): string;
}

// FIPS → USPS for states/territories in us-atlas.
export const FIPS_TO_USPS: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
  "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
  "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "60": "AS", "66": "GU", "69": "MP", "72": "PR", "78": "VI",
};

const INSET_FIPS: Record<string, Exclude<MapArea, "main">> = { "60": "AS", "78": "VI" };
const SKIP_FIPS = new Set(["66", "69", "72"]); // territories without a national park

// Extents framing each park's islands (not the whole territory, whose
// outlying atolls would shrink the islands to specks).
const INSET_EXTENT: Record<Exclude<MapArea, "main">, [[number, number], [number, number]]> = {
  AS: [[-171.0, -14.45], [-169.3, -14.05]],
  VI: [[-65.1, 17.65], [-64.55, 18.45]],
};

/** Arguments passed to a map's overlay snippet. */
export interface OverlayCtx {
  area: MapArea;
  layout: MapLayout;
  k: number; // zoom scale, to keep marks a constant on-screen size
}

let statesPromise: Promise<StateFeature[]> | null = null;

/** Load state shapes (code-split chunk, fetched only by map views). */
export function loadStates(): Promise<StateFeature[]> {
  statesPromise ??= import("us-atlas/states-10m.json").then((mod) => {
    const topo = (mod.default ?? mod) as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>;
    const fc = feature(topo, topo.objects.states) as unknown as FeatureCollection<Geometry, { name: string }>;
    return (fc.features as StateFeature[]).filter((f) => !SKIP_FIPS.has(f.id));
  });
  return statesPromise;
}

export function buildLayout(states: StateFeature[], width: number, height: number): MapLayout {
  const insetW = Math.max(64, Math.min(120, width * 0.11));
  const insetH = insetW * 0.7;
  const gap = 22; // room for the inset label
  const pad = 6;

  const mainFeatures = states.filter((f) => !INSET_FIPS[f.id]);
  const main = geoAlbersUsa().fitExtent(
    [
      [pad, pad],
      [width - insetW - pad * 3, height - pad],
    ],
    { type: "FeatureCollection", features: mainFeatures },
  );

  const insets: Inset[] = [
    { area: "AS", label: "American Samoa", x: width - insetW - pad, y: height - 2 * insetH - gap - pad - 14, w: insetW, h: insetH },
    { area: "VI", label: "Virgin Islands", x: width - insetW - pad, y: height - insetH - pad, w: insetW, h: insetH },
  ];

  const insetProj = {} as Record<Exclude<MapArea, "main">, GeoProjection>;
  for (const inset of insets) {
    const [[x0, y0], [x1, y1]] = INSET_EXTENT[inset.area];
    const corners: MultiPoint = { type: "MultiPoint", coordinates: [[x0, y0], [x1, y1]] };
    insetProj[inset.area] = geoMercator()
      .fitExtent(
        [
          [inset.x + 4, inset.y + 4],
          [inset.x + inset.w - 4, inset.y + inset.h - 4],
        ],
        corners,
      )
      .clipExtent([
        [inset.x, inset.y],
        [inset.x + inset.w, inset.y + inset.h],
      ]);
  }

  const mainPath = geoPath(main);
  const insetPath = {
    AS: geoPath(insetProj.AS),
    VI: geoPath(insetProj.VI),
  };

  const areaOf = (state: string): MapArea => (state === "AS" || state === "VI" ? state : "main");

  return {
    width,
    height,
    insets,
    areaOf,
    project(lon, lat, state) {
      const area = areaOf(state);
      const p = area === "main" ? main([lon, lat]) : insetProj[area]([lon, lat]);
      return p ? [p[0], p[1]] : null;
    },
    path(f) {
      const area = INSET_FIPS[f.id];
      return (area ? insetPath[area](f) : mainPath(f)) ?? "";
    },
  };
}
