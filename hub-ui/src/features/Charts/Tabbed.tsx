/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { Tabs, Text } from "@mantine/core";
import LineChart from "@/components/Charts/LineChart";
import styles from "@/features/Charts/Charts.module.css";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";
import { ETabTypes, TTypedOption } from "./types";

type Props = {
  collectionId: ICollection["id"];
  locationIds: string[];
  data: Array<CoverageJSON | CoverageCollection>;
  theme?: "light" | "dark";
  seriesLabels?: string[];
  tabs: TTypedOption[];
  chartClassname?: string;
  tabHeight?: number;
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
  } = props;

  const [tab, setTab] = useState<string | null>(
    tabs.length > 0 ? tabs[0].value : null,
  );

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      classNames={{
        root: styles.root,
        panel: `${styles.panel} ${chartClassname}`,
        tab: styles.tab,
      }}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab key={`${collectionId}-${tab.value}-tab`} value={tab.value}>
            <Text size="xs" p={0}>
              {tab.label}
            </Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>
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
              prettyLabels={tabs.filter(
                ({ type }) => type === ETabTypes.Parameter,
              )}
              theme={theme}
              filename={`line-chart-${locationIds.join("_")}-${String(collectionId)}-${tab.value}`}
              seriesLabels={seriesLabels}
              chosenParameter={tab.value}
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
              prettyLabels={tabs.filter(
                ({ type }) => type === ETabTypes.Parameter,
              )}
              theme={theme}
              filename={`line-chart-${locationIds.join("_")}-${String(collectionId)}-${tab.value}`}
              seriesLabels={seriesLabels}
              chosenUnit={tab.value}
            />
          </Tabs.Panel>
        ))}
    </Tabs>
  );
};
