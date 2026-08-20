/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IRequestParams } from '@ogcapi-js/shared';
import { TCoverageLabel, TWrappedCoverage } from '@/features/Charts/types';
import {
  computeCoverageLabel,
  findReusableCoverage,
  findStaleCoverage,
  isValid,
} from '@/features/Charts/utils';
import { Parameter } from '@/features/Popup';
import { CoverageCollection, CoverageJSON, ICollection } from '@/services/edr.service';
import { TLocation } from '@/stores/main/types';
import { getDatetime } from '@/utils/url';

dayjs.extend(isSameOrBefore);

const MAX_STALE_ENTRIES = 5;

type Args = {
  collectionId: ICollection['id'];
  locationIds: Array<TLocation['id']>;
  parameters: Parameter[];
  from: string | null;
  to: string | null;
  coverageLabels?: TCoverageLabel;

  getData: <T extends IRequestParams>(
    collectionId: ICollection['id'],
    locationId: TLocation['id'],
    params: T,
    signal?: AbortSignal
  ) => Promise<CoverageCollection | CoverageJSON> | CoverageCollection | CoverageJSON;

  onData?: (data?: TWrappedCoverage[]) => void;
  onLoading?: (loading: boolean) => void;
};

export const useTimeseriesData = (args: Args) => {
  const {
    collectionId,
    locationIds,
    parameters,
    from,
    to,
    coverageLabels,
    getData,
    onData = () => {},
    onLoading = () => {},
  } = args;

  const controller = useRef<AbortController | null>(null);
  const lastRequestKey = useRef<string | null>(null);
  const lastLocationIds = useRef<typeof locationIds>([]);

  const [data, setData] = useState<TWrappedCoverage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // reset when location set changes
  useEffect(() => {
    if (!locationIds.some((id) => lastLocationIds.current.includes(id))) {
      setData([]);
    }
    lastLocationIds.current = locationIds;
  }, [locationIds]);

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        collectionId,
        from,
        to,
        locationIds,
        parameters: parameters.map((p) => p.id),
        coverageLabels,
        getData: JSON.stringify(getData),
      }),
    [collectionId, from, to, locationIds, parameters, getData]
  );

  useEffect(() => {
    const isMounted = true;

    if (lastRequestKey.current === requestKey) {
      return;
    }
    lastRequestKey.current = requestKey;

    const isValidRange = from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;
    if (!isValidRange) {
      setError('Invalid date range provided');
      return;
    }

    controller.current = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        onLoading(true);

        const datetime = getDatetime(from, to);
        const paramIds = parameters.map((p) => p.id);

        const params: IRequestParams = {
          'parameter-name': paramIds.join(','),
          ...(datetime ? { datetime } : {}),
        };

        const wrappedByLoc = new Map<string, TWrappedCoverage>();

        const staleEntries = findStaleCoverage(
          data.map(({ locationId, createdAt }) => ({ locationId, createdAt })),
          locationIds,
          MAX_STALE_ENTRIES
        );

        const currentDataSnapshot = data.filter((w) => !staleEntries.includes(w.locationId));

        const pending = locationIds
          .map((locationId, idx) => {
            const cached = findReusableCoverage(
              currentDataSnapshot,
              locationId,
              datetime ?? null,
              paramIds
            );

            if (cached) {
              wrappedByLoc.set(locationId, {
                data: cached.data,
                label: computeCoverageLabel(locationId, idx, cached.data, coverageLabels),
                locationId,
                params,
                collectionId,
                createdAt: Date.now(),
              });
              return null;
            }

            return { locationId, idx, params };
          })
          .filter(Boolean) as Array<{ locationId: string; idx: number; params: IRequestParams }>;

        const results = await Promise.allSettled(
          pending.map((p) =>
            getData(collectionId, p.locationId, p.params, controller.current?.signal)
          )
        );

        if (!isMounted) {
          return;
        }

        const rejected: PromiseRejectedResult[] = [];

        results.forEach((res, i) => {
          const { locationId, idx } = pending[i];

          if (res.status === 'fulfilled' && isValid(res.value)) {
            wrappedByLoc.set(locationId, {
              data: res.value,
              label: computeCoverageLabel(locationId, idx, res.value, coverageLabels),
              locationId,
              params,
              collectionId,
              createdAt: Date.now(),
            });
          } else if (res.status === 'rejected') {
            rejected.push(res);
          }
        });

        const wrapped = locationIds
          .map((id) => wrappedByLoc.get(id))
          .filter(Boolean) as TWrappedCoverage[];

        setData(wrapped);
        onData(wrapped);

        setError(
          wrapped.length === 0 && rejected.length > 0
            ? 'Failed to load data for the requested locations.'
            : null
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
          onLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      if (controller.current) {
        // controller.current.abort('Effect closure');
      }
    };
  }, [requestKey]);

  useEffect(() => {
    return () => {
      lastRequestKey.current = null;
    };
  }, []);

  const locationSet = useMemo(() => new Set(locationIds), [locationIds]);

  const filtered = useMemo(
    () => data.filter((w) => locationSet.has(w.locationId)),
    [data, locationSet]
  );

  const chartData = useMemo(() => filtered.map((w) => w.data).filter(Boolean), [filtered]);

  const seriesLabels = useMemo(
    () => filtered.map((w) => w.label ?? String(w.locationId)),
    [filtered]
  );

  return {
    data,
    chartData,
    seriesLabels,
    isLoading,
    error,
  };
};
