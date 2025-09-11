/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LineChart as _LineChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { coverageJSONToSeries } from '@/components/Charts/utils';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';
import { isCoverageCollection } from '@/utils/clarifyObject';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  ToolboxComponent,
  _LineChart,
  CanvasRenderer,
]);

type Props = {
  data: CoverageJSON | CoverageCollection;
  title?: string;
  legend?: boolean;
  filename?: string;
  theme?: 'light' | 'dark';
  legendEntries?: string[];
};

const LineChart = (props: Props) => {
  const { title, data, legend = false, filename, theme = 'light', legendEntries = [] } = props;

  const option: echarts.EChartsCoreOption = useMemo(() => {
    const dates = isCoverageCollection(data)
      ? data.coverages[0]?.domain.axes.t.values
      : data.domain.axes.t.values;

    const series = coverageJSONToSeries(data);

    return {
      title: title ? { text: title } : undefined,
      tooltip: {
        trigger: 'axis',
      },
      legend: legend ? { data: legendEntries } : undefined,
      toolbox: {
        feature: {
          saveAsImage: {
            show: true,
            type: 'png',
            name: filename ? filename : title ? title : 'line-chart',
          },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: 'value',
      },
      series,
    };
  }, [data, title, legend]);

  return (
    <ReactEChartsCore
      style={{
        height: '100%',
        width: '98%',
        marginLeft: '8px',
      }}
      echarts={echarts}
      option={option}
      theme={theme}
      lazyUpdate
    />
  );
};

export default LineChart;
