/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { Group, Skeleton, Text, useComputedColorScheme } from "@mantine/core";
import LineChart from "@/components/Charts/LineChart";
import styles from "@/features/Download/Download.module.css";
import { getDatetime } from "@/features/Download/Modal/utils";
import loadingManager from "@/managers/Loading.init";
import notificationManager from "@/managers/Notification.init";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLocation } from "@/stores/main/types";
import { ELoadingType, ENotificationType } from "@/stores/session/types";

type Props = {
  instanceId: number;
  collectionId: ICollection["id"];
  locationId: TLocation["id"];
  parameters: string[];
  from: string | null;
  to: string | null;
  onData: () => void;
};

export const Chart: React.FC<Props> = (props) => {
  const { instanceId, collectionId, locationId, parameters, from, to, onData } =
    props;

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const loadingInstance = useRef<string>(null);

  const computedColorScheme = useComputedColorScheme();

  const [data, setData] = useState<CoverageCollection | CoverageJSON | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    loadingInstance.current = loadingManager.add(
      `Fetching chart data for location: ${locationId}, from data source: ${collectionId}`,
      ELoadingType.Data,
    );
    try {
      controller.current = new AbortController();

      const datetime = getDatetime(from, to);

      const coverageCollection = await wwdhService.getLocation<
        CoverageCollection | CoverageJSON
      >(collectionId, String(locationId), {
        signal: controller.current.signal,
        params: {
          "parameter-name": parameters.join(","),
          ...(datetime ? { datetime } : {}),
        },
      });

      if (isMounted.current) {
        loadingInstance.current = loadingManager.remove(
          loadingInstance.current,
        );
        setData(coverageCollection);
        onData();
      }
    } catch (error) {
      if (
        (error as Error)?.name === "AbortError" ||
        (typeof error === "string" && error === "Component unmount")
      ) {
        console.log("Fetch request canceled");
      } else if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
          10000,
        );
        setError(_error.message);
      }

      if (loadingInstance.current) {
        loadingInstance.current = loadingManager.remove(
          loadingInstance.current,
        );
      }
      onData();
    }
  };

  useEffect(() => {
    isMounted.current = true;
    setData(null);
    void fetchData();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, [instanceId]);

  return (
    <Skeleton
      height={55} // Default dimensions of chart
      visible={Boolean(loadingInstance.current)}
      className={styles.chartWrapper}
    >
      {data ? (
        <LineChart
          data={data}
          legend
          legendEntries={parameters}
          theme={computedColorScheme}
          filename={`line-chart-${locationId}-${parameters.join("-")}`}
        />
      ) : (
        <Group justify="center" align="center" className={styles.chartNoData}>
          <Text>No Data found for {parameters.join(", ")}</Text>
        </Group>
      )}
      {error && (
        <Text c="red">
          <strong>Error: </strong>
          {error}
        </Text>
      )}
    </Skeleton>
  );
};
