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
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { isCoverageCollection } from "@/utils/isTypeObject";
import { getLabel } from "@/utils/parameters";
import { getDatetime } from "@/utils/url";

dayjs.extend(isSameOrBefore);

type Props = {
  collectionId: ICollection["id"];
  /** CHANGED: support multiple locations */
  locationIds: Array<TLocation["id"]>;
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
    locationIds,
    parameters,
    from,
    to,
    className = "",
    onData = () => null,
  } = props;

  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const computedColorScheme = useComputedColorScheme();

  const [data, setData] = useState<Array<CoverageCollection | CoverageJSON>>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labels, setLabels] = useState<
    Array<{ parameter: string; label: string }>
  >([]);

  /** Validate a single coverage */
  const isValid = (coverage: CoverageCollection | CoverageJSON) => {
    if (isCoverageCollection(coverage) && coverage.coverages.length === 0) {
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    const loadingInstance = loadingManager.add(
      `Fetching chart data for locations: ${locationIds.join(", ")}, of collection: ${collectionId}`,
      ELoadingType.Data,
    );
    setIsLoading(true);

    try {
      controller.current = new AbortController();
      const signal = controller.current.signal;

      const datetime = getDatetime(from, to);
      const params = {
        "parameter-name": parameters.join(","),
        ...(datetime ? { datetime } : {}),
      };

      const requests = locationIds.map((locationId) =>
        wwdhService.getLocation<CoverageCollection | CoverageJSON>(
          collectionId,
          locationId,
          {
            signal,
            params,
          },
        ),
      );

      const results = await Promise.allSettled(requests);

      if (!isMounted.current) {
        return;
      }

      // Collect successes and filter out empty collections
      const fulfilled = results
        .filter(
          (r): r is PromiseFulfilledResult<CoverageCollection | CoverageJSON> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value)
        .filter(isValid);

      // Track rejections
      // Added some handling to improve dev mode experience
      const rejected = results.filter(
        (r): r is PromiseRejectedResult =>
          r.status === "rejected" &&
          r.reason !== "Component unmount" &&
          !(typeof r.reason === "string" && r.reason.includes("AbortError")),
      );

      setData(fulfilled);

      if (rejected.length > 0) {
        // TODO: add more indepth notification
        notificationManager.show(
          `Some locations failed to load (${rejected.length}/${results.length}).`,
          ENotificationType.Info,
          8000,
        );
      }

      // No data
      if (fulfilled.length === 0 && rejected.length > 0) {
        setError("Failed to load data for the requested locations.");
      } else {
        setError(null);
      }

      onData();
    } catch (err) {
      if (
        (err as Error)?.name === "AbortError" ||
        (typeof err === "string" && err === "Component unmount")
      ) {
        console.warn("Fetch request canceled");
      } else if ((err as Error)?.message) {
        const _error = err as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
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
    setData([]);
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
    // Re-run when locations or date filters change
  }, [locationIds, from, to, collectionId, parameters]);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);
    if (collection) {
      const labels = parameters.map((parameter) => ({
        parameter,
        label: getLabel(collection, parameter),
      }));
      setLabels(labels);
    }
  }, [parameters, collectionId]);

  return (
    <Skeleton
      visible={isLoading}
      className={`${className} ${styles.chartWrapper}`}
    >
      {data.length > 0 ? (
        <LineChart
          data={data}
          legend
          legendEntries={parameters}
          prettyLabels={labels}
          theme={computedColorScheme}
          filename={`line-chart-${locationIds.join(",")}-${String(
            collectionId,
          )}-${parameters.join("-")}`}
        />
      ) : (
        !error && (
          <Group justify="center" align="center" className={styles.chartNoData}>
            <Text>
              No Data found for{" "}
              {labels.length > 0
                ? labels.map((l) => l.label).join(", ")
                : parameters.join(", ")}
            </Text>
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
``;
