/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Skeleton, Tabs, Text } from '@mantine/core';
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
  tabs: TTypedOption[];
  chartClassname?: string;
  tabHeight?: number;
  showTabs?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  parserOptions?: TCoverageOptions;
  useDataZoom?: boolean;
  xAxisOverride?: XAXisOption;
};

export const Tabbed: React.FC<Props> = (props) => {
  const {
    collectionId,
    locationIds,
    data,
    theme,
    seriesLabels,
    tabs,
    chartClassname,
    tabHeight = 20,
    showTabs = true,
    disabled = false,
    isLoading = false,
    parserOptions,
    useDataZoom,
    xAxisOverride,
  } = props;

  const [tab, setTab] = useState<string | null>(tabs.length > 0 ? tabs[0].value : null);

  useEffect(() => {
    if ((tab ?? '').length > 0 || tabs.length === 0 || data.length === 0) {
      return;
    }

    setTab(tabs[0].value);
  }, [tabs, data]);

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      classNames={{
        root: styles.root,
        panel: `${styles.panel} ${chartClassname}`,
        tab: styles.tab,
      }}
      keepMounted={false}
    >
      {showTabs && (
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={`${collectionId}-${tab.value}-tab`}
              value={tab.value}
              disabled={disabled || data.length === 0}
            >
              <Text size="xs" p={0}>
                {tab.label}
              </Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      )}
      {isLoading ? (
        <Skeleton h={`${tabHeight}rem`} w="auto" radius={0} />
      ) : (
        <>
          {tabs
            .filter((tab) => tab.type === ETabTypes.Parameter)
            .map((tab) => (
              <Tabs.Panel
                key={`${collectionId}-${tab.value}-tab-panel`}
                value={tab.value}
                h={`${tabHeight}rem`}
              >
                <LineChart
                  data={data}
                  legend
                  prettyLabels={tabs.filter(({ type }) => type === ETabTypes.Parameter)}
                  theme={theme}
                  filename={`line-chart-${locationIds.join('_')}-${String(collectionId)}-${tab.value}`}
                  seriesLabels={seriesLabels}
                  parserOptions={{ ...parserOptions, chosenParameter: tab.value }}
                  useDataZoom={useDataZoom}
                  xAxisOverride={xAxisOverride}
                />
              </Tabs.Panel>
            ))}
          {tabs
            .filter((tab) => tab.type === ETabTypes.Unit)
            .map((tab) => (
              <Tabs.Panel
                key={`${collectionId}-${tab.value}-tab-panel`}
                value={tab.value}
                h={`${tabHeight}rem`}
              >
                <LineChart
                  data={data}
                  legend
                  prettyLabels={tabs.filter(({ type }) => type === ETabTypes.Parameter)}
                  theme={theme}
                  filename={`line-chart-${locationIds.join('_')}-${String(collectionId)}-${tab.value}`}
                  seriesLabels={seriesLabels}
                  parserOptions={{ ...parserOptions, chosenUnit: tab.value }}
                  useDataZoom={useDataZoom}
                  xAxisOverride={xAxisOverride}
                />
              </Tabs.Panel>
            ))}
        </>
      )}
    </Tabs>
  );
};
