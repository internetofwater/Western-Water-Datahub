/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useRef, useState } from "react";
import { Group, Skeleton, Text, useComputedColorScheme } from "@mantine/core";
import LineChart from "@/components/Charts/LineChart";
import styles from "@/features/Popup/Popup.module.css";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLocation } from "@/stores/main/types";
import { LoadingType, NotificationType } from "@/stores/session/types";
import { isCoverageCollection } from "@/utils/isTypeObject";
import { getLabel } from "@/utils/parameters";
import { getDatetime } from "@/utils/url";

dayjs.extend(isSameOrBefore);

type Props = {
  collectionId: ICollection["id"];
  locationId: TLocation["id"];
  title: string;
  parameters: string[];
  from: string | null;
  to: string | null;
  className?: string;
  onData?: () => void;
};

export const Chart: React.FC<Props> = (props) => {
  const {
    collectionId,
    locationId,
    parameters,
    from,
    to,
    className = "",
    onData = () => null,
  } = props;

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const computedColorScheme = useComputedColorScheme();

  const [data, setData] = useState<CoverageCollection | CoverageJSON | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labels, setLabels] = useState<
    Array<{ parameter: string; label: string }>
  >([]);

  const fetchData = async () => {
    const loadingInstance = loadingManager.add(
      `Fetching chart data for location: ${locationId}, of collection: ${collectionId}`,
      LoadingType.Data,
    );
    setIsLoading(true);
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
          NotificationType.Error,
          10000,
        );
        setError(_error.message);
      }

      onData();
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      loadingManager.remove(loadingInstance);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    setData(null);
    setError(null);

    const isValidRange =
      from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;
    if (isValidRange) {
      void fetchData();
    } else {
      setError("Invalid date range provided");
    }
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, [locationId, from, to]);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);
    if (collection) {
      const labels = parameters.map((parameter) => ({
        parameter,
        label: getLabel(collection, parameter),
      }));

      setLabels(labels);
    }
  }, [parameters]);

  const isValid = (coverage: CoverageCollection | CoverageJSON) => {
    if (isCoverageCollection(coverage) && coverage.coverages.length === 0) {
      return false;
    }

    return true;
  };

  return (
    <Skeleton
      visible={isLoading}
      className={`${className} ${styles.chartWrapper}`}
    >
      {data && isValid(data) ? (
        <LineChart
          data={data}
          legend
          legendEntries={parameters}
          prettyLabels={labels}
          theme={computedColorScheme}
          filename={`line-chart-${locationId}-${parameters.join("-")}`}
        />
      ) : (
        !error && (
          <Group justify="center" align="center" className={styles.chartNoData}>
            <Text>No Data found for {parameters.join(", ")}</Text>
          </Group>
        )
      )}
      {error && (
        <Group justify="center" align="center" className={styles.chartNoData}>
          <Text c="red">
            <strong>Error: </strong>
            {error}
          </Text>
        </Group>
      )}
    </Skeleton>
  );
};
