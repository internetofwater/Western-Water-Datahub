/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useRef, useState } from "react";
import { IRequestParams } from "@ogcapi-js/shared";
import { Loader, useComputedColorScheme } from "@mantine/core";
import loadingManager from "@/managers/Loading.init";
import notificationManager from "@/managers/Notification.init";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { getDatetime } from "@/utils/url";
import { Parameter } from "../Popup";
import { Tabbed } from "./Tabbed";
import {
  ETabTypes,
  TCoverageLabel,
  TTypedOption,
  TWrappedCoverage,
} from "./types";
import { Unmanaged } from "./Unmanaged";
import {
  computeCoverageLabel,
  findReusableCoverage,
  findStaleCoverage,
  isValid,
} from "./utils";

dayjs.extend(isSameOrBefore);

const MAX_STALE_ENTRIES = 5;

type Props = {
  collectionId: ICollection["id"];
  locationIds: Array<TLocation["id"]>;
  title?: string;
  parameter?: string;
  parameters: Parameter[];
  from: string | null;
  to: string | null;
  className?: string;
  tabs?: boolean;
  select?: boolean;
  value?: string | null;
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
  coverageLabels?: TCoverageLabel;
};

export const Charts: React.FC<Props> = (props) => {
  const {
    collectionId,
    locationIds,
    parameters,
    from,
    to,
    tabs = false,
    // TODO: build self-managed select version
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    select = false,
    className,
    onData = () => null,
    getData,
    coverageLabels,
    value = null,
  } = props;

  const controller = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const computedColorScheme = useComputedColorScheme();

  const [data, setData] = useState<TWrappedCoverage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [options, setOptions] = useState<TTypedOption[]>([]);

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
      const paramIds = parameters.map((p) => p.id);
      const params: IRequestParams = {
        "parameter-name": paramIds.join(","),
        ...(datetime ? { datetime } : {}),
      };

      type Pending = {
        locationId: string;
        idx: number;
        params: IRequestParams;
      };
      const pending: Pending[] = [];
      const wrappedByLoc = new Map<string, TWrappedCoverage>(); // locationId -> wrapped

      const staleEntries = findStaleCoverage(
        data.map(({ locationId, createdAt }) => ({ locationId, createdAt })),
        locationIds,
        MAX_STALE_ENTRIES,
      );

      const currentDataSnapshot = data.filter(
        (w) => !staleEntries.includes(w.locationId),
      ); // assuming this is the fresh state here

      locationIds.forEach((locId, idx) => {
        const cached = findReusableCoverage(
          currentDataSnapshot,
          locId,
          datetime ?? null,
          paramIds,
        );

        if (cached) {
          wrappedByLoc.set(locId, {
            data: cached.data, // do not clone or mutate
            label: computeCoverageLabel(
              locId,
              idx,
              cached.data,
              coverageLabels,
            ),
            locationId: locId,
            params,
            collectionId,
            createdAt: Date.now(),
          });
        } else {
          pending.push({ locationId: locId, idx, params });
        }
      });
      const requests = pending.map((p) =>
        getData(collectionId, p.locationId, p.params, signal),
      );
      const results = await Promise.allSettled(requests);

      if (!isMounted.current) {
        return;
      }

      const rejected: PromiseRejectedResult[] = [];

      // Assign fetched results to their locationId slots
      results.forEach((res, i) => {
        const { locationId, idx } = pending[i];

        if (res.status === "fulfilled") {
          const cov = res.value;
          if (!isValid(cov)) {
            // silently skip invalid
            return;
          }
          wrappedByLoc.set(locationId, {
            data: cov, // do not clone or mutate
            label: computeCoverageLabel(locationId, idx, cov, coverageLabels),
            locationId,
            params,
            collectionId,
            createdAt: Date.now(),
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

      // Build the final `wrapped` list in the same order as `locationIds`
      const wrapped: TWrappedCoverage[] = locationIds
        .filter((locationId) => locationIds.includes(locationId))
        .map((locId) => wrappedByLoc.get(locId))
        .filter((w): w is TWrappedCoverage => Boolean(w));

      setData(wrapped);

      if (rejected.length > 0) {
        notificationManager.show(
          `Some locations failed to load (${rejected.length}/${pending.length}).`,
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
    const paramOptions = parameters.map(({ id, name, unit }) => ({
      value: id,
      label: `${name} (${unit})`,
      type: ETabTypes.Parameter,
    }));

    const unitOptions = Array.from(new Set(parameters.map((p) => p.unit))).map(
      (unit) => ({
        value: unit,
        label: unit,
        type: ETabTypes.Unit,
      }),
    );

    setOptions([...paramOptions, ...unitOptions]);
  }, [parameters, collectionId]);

  // Extract the underlying coverages and labels for the chart
  const chartData = data
    .filter((w) => locationIds.includes(w.locationId))
    .map((w) => w.data);
  const seriesLabels = data
    .filter((w) => locationIds.includes(w.locationId))
    .map((w) => w.label ?? String(w.locationId));

  const showTabs = tabs && options.length > 0 && chartData.length > 0;
  const showUnmanaged = !select && !tabs && typeof value === "string";

  return (
    <>
      {error && error.length > 0 && <>{error}</>}
      {showTabs && (
        <Tabbed
          collectionId={collectionId}
          data={chartData}
          locationIds={locationIds}
          theme={computedColorScheme}
          seriesLabels={seriesLabels}
          tabs={options}
          chartClassname={className}
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
        />
      )}
      {isLoading && <Loader type="dots" />}
    </>
  );
};
