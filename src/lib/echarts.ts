// Single ECharts setup for the whole app: registers the components once and
// exposes a Svelte action that handles init, resizing and disposal.
//
//   <div use:echart={option}></div>

import * as echarts from "echarts/core";
import { BarChart, HeatmapChart, LineChart, ScatterChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { Action } from "svelte/action";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  ScatterChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export type EChartsOption = Record<string, unknown>;
export interface EChartParams {
  option: EChartsOption;
  /** Called with the chart instance once, e.g. to bind click handlers. */
  onInit?: (chart: echarts.ECharts) => void;
}

export const echart: Action<HTMLElement, EChartParams> = (node, params) => {
  const chart = echarts.init(node);
  chart.setOption(params.option);
  params.onInit?.(chart);

  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(node);

  return {
    update(next) {
      chart.setOption(next.option);
    },
    destroy() {
      ro.disconnect();
      chart.dispose();
    },
  };
};
