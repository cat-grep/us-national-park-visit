// Context shown on time-series charts and in park details, so readers can
// tell real trends from external shocks and status changes.

export interface TimelineEvent {
  year: number;
  label: string;
  detail: string;
}

export const EVENTS: TimelineEvent[] = [
  {
    year: 2013,
    label: "2013 shutdown",
    detail: "Federal government shutdown closed national parks for 16 days in October 2013.",
  },
  {
    year: 2020,
    label: "COVID-19",
    detail: "Pandemic closures and restrictions sharply reduced visits in 2020.",
  },
];

/**
 * Year each unit was designated a National Park, for units designated during
 * the dataset period. Earlier visits were recorded under the unit's previous
 * status (e.g. National Monument), so they are included in the data.
 */
export const DESIGNATED: Record<string, number> = {
  GAAR: 1980,
  GLBA: 1980,
  KATM: 1980,
  KEFJ: 1980,
  KOVA: 1980,
  LACL: 1980,
  WRST: 1980,
  GRBA: 1986,
  NPSA: 1988,
  DRTO: 1992,
  DEVA: 1994,
  JOTR: 1994,
  SAGU: 1994,
  BLCA: 1999,
  CUVA: 2000,
  CONG: 2003,
  GRSA: 2004,
  PINN: 2013,
  JEFF: 2018,
  INDU: 2019,
  WHSA: 2019,
  NERI: 2020,
};

/** ECharts markLine config for the timeline events on a category year axis. */
export const eventMarkLine = (color: string, labelColor: string) => ({
  silent: true,
  symbol: "none",
  lineStyle: { color, type: "dashed", width: 1 },
  label: { color: labelColor, formatter: (p: { name: string }) => p.name, position: "insideEndTop", fontSize: 11 },
  data: EVENTS.map((e) => ({ name: e.label, xAxis: String(e.year) })),
});
