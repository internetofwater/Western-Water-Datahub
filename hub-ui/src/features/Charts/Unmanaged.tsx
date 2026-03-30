/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box } from "@mantine/core";
import LineChart from "@/components/Charts/LineChart";
import styles from "@/features/Charts/Charts.module.css";
import { ETabTypes, TTypedOption } from "@/features/Charts/types";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";

type Props = {
  collectionId: ICollection["id"];
  locationIds: string[];
  data: Array<CoverageJSON | CoverageCollection>;
  theme?: "light" | "dark";
  seriesLabels?: string[];
  entries: TTypedOption[];
  chartClassname?: string;
  value: string;
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
  } = props;

  return (
    <>
      {entries
        .filter((tab) => tab.type === ETabTypes.Parameter)
        .map((tab) => (
          <Box
            key={`${collectionId}-${tab.value}-unmanaged-panel`}
            className={`${styles.panel} ${chartClassname}`}
            style={{ display: value === tab.value ? "block" : "none" }}
          >
            <LineChart
              data={data}
              legend
              prettyLabels={entries.filter(
                ({ type }) => type === ETabTypes.Parameter,
              )}
              theme={theme}
              filename={`line-chart-${locationIds.join("_")}-${String(collectionId)}-${tab.value}`}
              seriesLabels={seriesLabels}
              chosenParameter={tab.value}
            />
          </Box>
        ))}
      {entries
        .filter((tab) => tab.type === ETabTypes.Unit)
        .map((tab) => (
          <Box
            key={`${collectionId}-${tab.value}-unmanaged-panel`}
            className={`${styles.panel} ${chartClassname}`}
            style={{ display: value === tab.value ? "block" : "none" }}
          >
            <LineChart
              data={data}
              legend
              prettyLabels={entries.filter(
                ({ type }) => type === ETabTypes.Parameter,
              )}
              theme={theme}
              filename={`line-chart-${locationIds.join("_")}-${String(collectionId)}-${tab.value}`}
              seriesLabels={seriesLabels}
              chosenUnit={tab.value}
            />
          </Box>
        ))}
    </>
  );
};
