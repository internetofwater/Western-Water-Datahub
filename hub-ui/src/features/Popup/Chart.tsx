/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useRef, useState } from "react";
import { IRequestParams } from "@ogcapi-js/shared";
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
import { TLocation } from "@/stores/main/types";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { isCoverageCollection } from "@/utils/isTypeObject";
import { getLabel } from "@/utils/parameters";
import { getDatetime } from "@/utils/url";

dayjs.extend(isSameOrBefore);

type WrappedCoverage = {
  data: CoverageCollection | CoverageJSON;
  label?: string;
  locationId: TLocation["id"];
};

type Props = {
  collectionId: ICollection["id"];
  locationIds: Array<TLocation["id"]>;
  title?: string;
  parameters: string[];
  from: string | null;
  to: string | null;
  className?: string;
  onData?: () => void;
  getData: <T extends IRequestParams>(
    collectionId: ICollection["id"],
    locationId: TLocation["id"],
    params: T,
    signal?: AbortSignal,
  ) =>
    | CoverageCollection
    | CoverageJSON
    | Promise<CoverageCollection | CoverageJSON>;
  coverageLabels?:
    | Record<string, string>
    | ((args: {
        locationId: TLocation["id"];
        index: number; // index into locationIds
        coverage: CoverageCollection | CoverageJSON;
      }) => string);
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
    getData,
    coverageLabels,
  } = props;

  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const computedColorScheme = useComputedColorScheme();

  const [data, setData] = useState<WrappedCoverage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prettyParamLabels, setPrettyParamLabels] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // Validate a single coverage
  const isValid = (coverage: CoverageCollection | CoverageJSON) => {
    if (isCoverageCollection(coverage) && coverage.coverages.length === 0) {
      return false;
    }
    return true;
  };

  const computeCoverageLabel = (
    locationId: TLocation["id"],
    index: number,
    coverage: CoverageCollection | CoverageJSON,
  ): string => {
    if (typeof coverageLabels === "function") {
      try {
        const val = coverageLabels({ locationId, index, coverage });
        if (val && String(val).trim().length > 0) {
          return String(val).trim();
        }
      } catch {
        // TODO: graceful handling for no label
        return locationId;
      }
    }
    if (coverageLabels && typeof coverageLabels === "object") {
      const key = String(locationId);
      const val = coverageLabels[key];
      if (val && String(val).trim().length > 0) {
        return String(val).trim();
      }
    }
    return String(locationId);
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
        getData(collectionId, locationId, params as IRequestParams, signal),
      );

      const results = await Promise.allSettled(requests);

      if (!isMounted.current) {
        return;
      }

      const wrapped: WrappedCoverage[] = [];
      const rejected: PromiseRejectedResult[] = [];

      results.forEach((res, idx) => {
        const locId = locationIds[idx];

        if (res.status === "fulfilled") {
          const cov = res.value;
          if (!isValid(cov)) {
            return;
          }

          wrapped.push({
            data: cov, // do not clone or mutate
            label: computeCoverageLabel(locId, idx, cov),
            locationId: locId,
          });
        } else {
          const reason = res.reason;
          if (
            reason !== "Component unmount" &&
            !(typeof reason === "string" && reason.includes("AbortError"))
          ) {
            rejected.push(res);
          }
        }
      });

      setData(wrapped);

      if (rejected.length > 0) {
        // TODO: add more in-depth notification / per-location surfacing if needed
        notificationManager.show(
          `Some locations failed to load (${rejected.length}/${results.length}).`,
          ENotificationType.Info,
          8000,
        );
      }

      if (wrapped.length === 0 && rejected.length > 0) {
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
  }, [locationIds, from, to, collectionId, parameters, coverageLabels]);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);
    if (collection) {
      const labels = parameters.map((parameter) => ({
        value: parameter,
        label: getLabel(collection, parameter),
      }));
      setPrettyParamLabels(labels);
    }
  }, [parameters, collectionId]);

  // Extract the underlying coverages and series labels for the chart
  const chartData = data.map((w) => w.data);
  const seriesLabels = data.map((w) => w.label ?? String(w.locationId));

  return (
    <Skeleton
      visible={isLoading}
      className={`${styles.chartWrapper} ${className}`}
    >
      {chartData.length > 0 ? (
        <LineChart
          data={chartData}
          legend
          legendEntries={parameters}
          prettyLabels={prettyParamLabels}
          theme={computedColorScheme}
          filename={`line-chart-${locationIds.join(",")}-${String(collectionId)}-${parameters.join("-")}`}
          seriesLabels={seriesLabels}
        />
      ) : (
        !error && (
          <Group justify="center" align="center" className={styles.chartNoData}>
            <Text>
              No Data found for{" "}
              {prettyParamLabels.length > 0
                ? prettyParamLabels.map((l) => l.label).join(", ")
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
