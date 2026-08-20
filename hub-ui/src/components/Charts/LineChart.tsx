/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LineChart as _LineChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import styles from '@/components/Charts/Charts.module.css';
import { EChartsSeries, PrettyLabel } from '@/components/Charts/types';
import { TCoverageOptions, XAXisOption } from '@/services/coverageJSON/types';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';
import { coverageChartService } from '@/services/init/coverage.init';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  DataZoomSliderComponent,
  _LineChart,
  CanvasRenderer,
]);

type Props = {
  data: Array<CoverageJSON | CoverageCollection>;
  title?: string;
  legend?: boolean;
  filename?: string;
  prettyLabels?: PrettyLabel[];
  theme?: 'light' | 'dark';
  legendEntries?: string[];
  seriesLabels?: string[];
  chosenParameter?: string; // TODO: move these into parserOptions and deprecate
  chosenUnit?: string;
  parserOptions?: TCoverageOptions;
  useDataZoom?: boolean;
  xAxisOverride?: XAXisOption;
};

const extractPrettyLabel = (target: string, prettyLabels: PrettyLabel[] = []): string => {
  return prettyLabels.find((pl) => pl.value === target)?.label ?? target;
};

const LineChart = (props: Props) => {
  const {
    title,
    data,
    legend = false,
    filename,
    prettyLabels = [],
    theme = 'light',
    legendEntries = [],
    seriesLabels,
    chosenParameter,
    chosenUnit,
    parserOptions,
    useDataZoom = false,
    xAxisOverride,
  } = props;

  const option: echarts.EChartsCoreOption = useMemo(() => {
    const allSeries: EChartsSeries[] = [];
    const legendNames: string[] = [];
    let x;

    const parameter = chosenParameter ?? parserOptions?.chosenParameter;
    const unit = chosenUnit ?? parserOptions?.chosenUnit;

    // Validate seriesLabels alignment
    const useSeriesLabels = Array.isArray(seriesLabels) && seriesLabels.length === data.length;

    if (seriesLabels && !useSeriesLabels) {
      console.warn(
        '[LineChart] `seriesLabels` length does not match `data` length; ignoring seriesLabels.'
      );
    }

    data.forEach((entry, coverageIdx) => {
      const chartData = coverageChartService.coverageJSONToSeries(entry, {
        ...parserOptions,
      });

      let { series } = chartData;
      // TODO: determine if/how to handle differences in the x axis
      x = chartData.x;

      if (prettyLabels.length > 0 && prettyLabels.length >= series.length) {
        series = series.map((entrySeries) => {
          const pretty = extractPrettyLabel(entrySeries.name, prettyLabels);
          return {
            ...entrySeries,
            name: pretty,
          } as EChartsSeries;
        });
      }

      // Apply the label for this series
      if (useSeriesLabels) {
        const coverageLabel = seriesLabels![coverageIdx];
        series = series.map((series, index) => {
          const finalName = `${series.name} - ${coverageLabel}`;

          // Construct a stable id
          // This gets used to determine which series need to update
          const stableId = [
            parameter ?? 'param',
            unit ?? 'unit',
            coverageLabel ?? `cov-${coverageIdx}`,
            series.name,
            index,
          ].join('|');

          legendNames.push(finalName);
          return {
            ...series,
            id: stableId,
            name: finalName,
          };
        });
      } else {
        series.forEach((s) => legendNames.push(s.name));
      }

      allSeries.push(...series);
    });

    const computedLegendData =
      legendNames.length > 0
        ? legendNames
        : prettyLabels.length > 0
          ? prettyLabels.map((pl) => pl.label)
          : legendEntries;

    const name =
      parameter || unit
        ? { name: extractPrettyLabel(String(parameter ?? unit), prettyLabels) }
        : {};

    const dataZoomFeature = useDataZoom
      ? {
          // dataZoom: { // This Adds the chart buttons, leaving commented for now
          //   yAxisIndex: 'none',
          // },
          restore: {},
        }
      : {};

    const dataZoom = useDataZoom
      ? {
          dataZoom: [
            {
              type: 'slider',
              xAxisIndex: 0,
              top: 10,
              start: 0,
              end: 100,
            },
          ],
        }
      : {};

    return {
      title: title ? { text: title } : undefined,
      tooltip: {
        trigger: 'axis',
      },
      legend: legend
        ? {
            data: computedLegendData,
            top: 'bottom',
            bottom: 0,
            left: 'center',
            orient: 'horizontal',
          }
        : undefined,
      toolbox: {
        feature: {
          ...dataZoomFeature,
          saveAsImage: {
            show: true,
            type: 'png',
            name: filename ? filename : title ? title : 'line-chart',
          },
        },
      },
      grid: {
        left: '8%',
        right: '5%',
        top: useDataZoom ? '18%' : '12%',
        bottom: useDataZoom ? '15%' : '20%',
      },
      xAxis: x,
      yAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameRotate: 90,
        nameGap: 50,
        ...name,
      },
      series: allSeries,
      ...dataZoom,
    };
  }, [
    data,
    title,
    legend,
    filename,
    prettyLabels,
    seriesLabels,
    legendEntries,
    chosenParameter,
    chosenUnit,
  ]);

  if (data.length === 0) {
    return null;
  }

  if (xAxisOverride) {
    option.xAxis = xAxisOverride;
  }

  return (
    <ReactEChartsCore
      className={styles.smoothTransition}
      style={{
        height: '100%',
        width: '98%',
        marginLeft: '8px',
      }}
      echarts={echarts}
      option={option}
      theme={theme}
      // lazyUpdate
      notMerge
      lazyUpdate={false}
    />
  );
};

export default LineChart;
