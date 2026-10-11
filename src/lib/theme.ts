// Shared visual tokens for ECharts and D3 views.
// Categorical slots were validated (CVD + contrast, all pairs) against the
// chart surfaces below; keep the order fixed and never cycle beyond 3 slots.

import { format } from "d3-format";
import { interpolateLab } from "d3-interpolate";

export interface Tokens {
  dark: boolean;
  surface: string;
  page: string;
  ink: string;
  ink2: string;
  muted: string;
  grid: string;
  axis: string;
  context: string; // de-emphasised marks (e.g. non-selected lines)
  noData: string;
  land: string;
  series: [string, string, string];
  seq: (t: number) => string; // 0 → near-surface, 1 → strongest
}

const light: Tokens = {
  dark: false,
  surface: "#fffdf9",
  page: "#fbf6ee",
  ink: "#1f2328",
  ink2: "#4d4f52",
  muted: "#7d7b76",
  grid: "#e9e4da",
  axis: "#c9c3b6",
  context: "#d3cdc1",
  noData: "#ece7dd",
  land: "#f1ece2",
  series: ["#2d6db5", "#d4692e", "#16a07a"],
  seq: interpolateLab("#cde4c1", "#17452a"),
};

const dark: Tokens = {
  dark: true,
  surface: "#1d2125",
  page: "#15181b",
  ink: "#eceae4",
  ink2: "#c3c1b9",
  muted: "#8d8b85",
  grid: "#2c3136",
  axis: "#41474d",
  context: "#3e444a",
  noData: "#2a2f34",
  land: "#262b30",
  series: ["#3a86e0", "#d65e28", "#16a072"],
  seq: interpolateLab("#2f5039", "#c4ecae"),
};

export const tokens = (isDark: boolean): Tokens => (isDark ? dark : light);

/** Discrete steps of the sequential ramp, for ECharts visualMap. */
export const seqSteps = (t: Tokens, n = 7) =>
  Array.from({ length: n }, (_, i) => t.seq(i / (n - 1)));

// --- number formatting -----------------------------------------------------
const siFmt = format(".3~s");
/** Compact: 1.23M, 456k. */
export const fmtShort = (v: number) => siFmt(v).replace("G", "B");
/** Full: 1,234,567 */
export const fmtFull = (v: number) => v.toLocaleString("en-US");
export const fmtPct = format("+.1%");

// --- ECharts helpers -------------------------------------------------------
export const baseOption = (t: Tokens) => ({
  backgroundColor: "transparent",
  textStyle: { color: t.ink2, fontFamily: "inherit" },
  animationDuration: 600,
  tooltip: {
    backgroundColor: t.surface,
    borderColor: t.axis,
    textStyle: { color: t.ink, fontSize: 13 },
    extraCssText: "box-shadow:0 2px 8px rgba(0,0,0,.15);border-radius:6px;",
    confine: true,
  },
});

export const valueAxis = (t: Tokens, extra: Record<string, unknown> = {}) => ({
  type: "value",
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: t.muted, formatter: (v: number) => fmtShort(v) },
  splitLine: { lineStyle: { color: t.grid } },
  nameTextStyle: { color: t.muted },
  ...extra,
});

export const categoryAxis = (t: Tokens, data: (string | number)[], extra: Record<string, unknown> = {}) => ({
  type: "category",
  data,
  axisLine: { lineStyle: { color: t.axis } },
  axisTick: { show: false },
  axisLabel: { color: t.muted },
  nameTextStyle: { color: t.muted },
  ...extra,
});

/** Single-line line-end label: small icon, series name and last value. */
export const iconEndLabel = (t: Tokens, name: string, icon: string) => ({
  show: true,
  color: t.ink2,
  formatter: (p: { value: number }) => `{img|} ${name} {val|${fmtShort(p.value)}}`,
  rich: {
    img: { backgroundColor: { image: icon }, width: 18, height: 18 },
    val: { color: t.ink, fontWeight: "bold" },
  },
});

export const legend = (t: Tokens, extra: Record<string, unknown> = {}) => ({
  top: 0,
  icon: "roundRect",
  itemWidth: 12,
  itemHeight: 12,
  textStyle: { color: t.ink2 },
  ...extra,
});
