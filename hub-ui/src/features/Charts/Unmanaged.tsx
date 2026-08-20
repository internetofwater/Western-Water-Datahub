/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Box, Skeleton } from '@mantine/core';
import LineChart from '@/components/Charts/LineChart';
import styles from '@/features/Charts/Charts.module.css';
import { ETabTypes, TTypedOption } from '@/features/Charts/types';
import { TCoverageOptions, XAXisOption } from '@/services/coverageJSON/types';
import { CoverageCollection, CoverageJSON, ICollection } from '@/services/edr.service';

type Props = {
  collectionId: ICollection['id'];
  locationIds: string[];
  data: Array<CoverageJSON | CoverageCollection>;
  theme?: 'light' | 'dark';
  seriesLabels?: string[];
  entries: TTypedOption[];
  chartClassname?: string;
  value: string;
  isLoading?: boolean;
  parserOptions?: TCoverageOptions;
  useDataZoom?: boolean;
  xAxisOverride?: XAXisOption;
};

export const Unmanaged: React.FC<Props> = (props) => {
  const {
    collectionId,
    locationIds,
    data,
    theme,
    seriesLabels,
    entries: entries,
    chartClassname,
    value,
    isLoading = false,
    parserOptions,
    useDataZoom,
    xAxisOverride,
  } = props;

  const parameters = entries.filter((e) => e.type === ETabTypes.Parameter);
  const activeEntry = entries.find((e) => e.value === value);

  const chartParserOptions = useMemo(
    () => ({ ...parserOptions, chosenParameter: value }),
    [parserOptions, value]
  );

  if (isLoading) {
    return <Skeleton height="12rem" width="auto" />;
  }

  if (!activeEntry) {
    return null;
  }

  return (
    <Box
      key={`${collectionId}-${activeEntry.value}-unmanaged-panel`}
      className={`${styles.panel} ${chartClassname}`}
    >
      <LineChart
        data={data}
        legend
        prettyLabels={parameters}
        theme={theme}
        filename={`line-chart-${locationIds.join('_')}-${String(collectionId)}-${activeEntry.value}`}
        seriesLabels={seriesLabels}
        parserOptions={chartParserOptions}
        useDataZoom={useDataZoom}
        xAxisOverride={xAxisOverride}
      />
    </Box>
  );
};
