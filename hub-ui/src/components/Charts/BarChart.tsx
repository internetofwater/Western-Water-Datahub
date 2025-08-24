/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { BarChart as _BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { ECElementEvent } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GeoJsonProperties } from 'geojson';
import { Series } from '@/components/Charts/types';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  ToolboxComponent,
  _BarChart,
  CanvasRenderer,
]);

type BarChartSeries<T extends GeoJsonProperties> = Series<T> & {
  labelProperty: keyof T;
  valueProperty: keyof T;
  idProperty: keyof T;
  color: string | ((params: { value: number }) => string);
  cleanLabel?: (label: string) => string;
};

type Props<T extends GeoJsonProperties> = {
  series: BarChartSeries<T>[];
  title?: string;
  legend?: boolean;
  onChartClick?: (event: ECElementEvent) => void;
};

const BarChart = <T extends GeoJsonProperties>(props: Props<T>) => {
  const { title, series, legend = false, onChartClick } = props;

  const option: echarts.EChartsCoreOption = useMemo(
    () => ({
      title: title
        ? {
            text: title,
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '1%',
        right: '0%',
        bottom: '3%',
        containLabel: true,
      },
      legend: legend
        ? {
            data: series.map((_series) => _series.name),
          }
        : undefined,
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      yAxis: {
        type: 'category',

        data: series.flatMap(({ data, labelProperty, cleanLabel }) =>
          data.features.map((feature) =>
            cleanLabel
              ? cleanLabel(feature.properties![labelProperty])
              : feature.properties![labelProperty]
          )
        ),
        axisLabel: {
          hideOverlap: false,
          width: 100,
          overflow: 'truncate',
          margin: 8,
          textStyle: {
            fontSize: 11,
          },
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: { interval: 0, rotate: -30 },
      },
      series: series.map(({ data, name, color, valueProperty, idProperty }) => ({
        name,
        type: 'bar',
        stack: 'total',

        itemStyle: {
          color,
        },
        emphasis: {
          focus: 'series',
        },
        data: data.features.map((feature) => ({
          value: Number(feature.properties![valueProperty]),
          id: feature.properties![idProperty],
        })),
      })),
    }),
    [series]
  );

  // TODO: this is a hack to allow click events without removing animations
  // if function changes even in metadata then chart full rerenders
  const _onChartClick = useCallback(onChartClick ? onChartClick : () => null, []);

  return (
    <ReactEChartsCore
      style={{
        height: '100%',
        width: '98%',
        marginLeft: '8px',
      }}
      echarts={echarts}
      option={option}
      lazyUpdate
      onEvents={{ click: _onChartClick }}
    />
  );
};

export default BarChart;
