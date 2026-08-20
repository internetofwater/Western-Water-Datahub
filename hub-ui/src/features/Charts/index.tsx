/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { IRequestParams } from '@ogcapi-js/shared';
import { Loader, useComputedColorScheme } from '@mantine/core';
import { Tabbed } from '@/features/Charts/Tabbed';
import { ETabTypes, TCoverageLabel, TTypedOption, TWrappedCoverage } from '@/features/Charts/types';
import { Unmanaged } from '@/features/Charts/Unmanaged';
import { Parameter } from '@/features/Popup';
import { useTimeseriesData } from '@/hooks/useTimeseriesData';
import { TCoverageOptions, XAXisOption } from '@/services/coverageJSON/types';
import { CoverageCollection, CoverageJSON, ICollection } from '@/services/edr.service';
import { TLocation } from '@/stores/main/types';

type Props = {
  collectionId: ICollection['id'];
  locationIds: Array<TLocation['id']>;
  parameters: Parameter[];
  from: string | null;
  to: string | null;
  className?: string;
  tabs?: boolean;
  select?: boolean;
  value?: string | null;
  tabHeight?: number;
  parserOptions?: TCoverageOptions;
  useDataZoom?: boolean;
  xAxisOverride?: XAXisOption;
  onData?: (data?: TWrappedCoverage[]) => void;
  onLoading?: (isLoading: boolean) => void;
  getData: <T extends IRequestParams>(
    collectionId: ICollection['id'],
    locationId: TLocation['id'],
    params: T,
    signal?: AbortSignal
  ) => CoverageCollection | CoverageJSON | Promise<CoverageCollection | CoverageJSON>;
  coverageLabels?: TCoverageLabel;
};

export const Charts: React.FC<Props> = ({
  collectionId,
  locationIds,
  parameters,
  from,
  to,
  className,
  tabs = false,
  select = false,
  value = null,
  tabHeight,
  parserOptions,
  useDataZoom,
  xAxisOverride,
  onData = () => null,
  onLoading = () => null,
  getData,
  coverageLabels,
}) => {
  const computedColorScheme = useComputedColorScheme();

  const [options, setOptions] = useState<TTypedOption[]>([]);

  const { chartData, seriesLabels, isLoading, error } = useTimeseriesData({
    collectionId,
    locationIds,
    parameters,
    from,
    to,
    coverageLabels,
    getData,
    onData,
    onLoading,
  });

  useEffect(() => {
    const paramOptions = parameters.map(({ id, name, unit }) => ({
      value: id,
      label: `${name} (${unit})`,
      type: ETabTypes.Parameter,
    }));

    const unitOptions = Array.from(new Set(parameters.map((p) => p.unit))).map((unit) => ({
      value: unit,
      label: unit,
      type: ETabTypes.Unit,
    }));

    setOptions([...paramOptions, ...unitOptions]);
  }, [parameters]);

  const showTabs = tabs && options.length > 0 && chartData.length > 0;
  const showUnmanaged = !select && !tabs && typeof value === 'string' && chartData.length > 0;

  return (
    <>
      {error && <>{error}</>}

      {showTabs && (
        <Tabbed
          collectionId={collectionId}
          data={chartData}
          locationIds={locationIds}
          theme={computedColorScheme}
          seriesLabels={seriesLabels}
          tabs={options}
          chartClassname={className}
          tabHeight={tabHeight}
          disabled={isLoading}
          isLoading={isLoading}
          parserOptions={parserOptions}
          useDataZoom={useDataZoom}
          xAxisOverride={xAxisOverride}
        />
      )}

      {showUnmanaged && (
        <Unmanaged
          collectionId={collectionId}
          data={chartData}
          locationIds={locationIds}
          theme={computedColorScheme}
          seriesLabels={seriesLabels}
          entries={options}
          chartClassname={className}
          value={value}
          isLoading={isLoading}
          parserOptions={parserOptions}
          useDataZoom={useDataZoom}
          xAxisOverride={xAxisOverride}
        />
      )}

      {isLoading && <Loader type="dots" />}
    </>
  );
};
