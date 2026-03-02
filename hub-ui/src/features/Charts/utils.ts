/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { IRequestParams } from "@ogcapi-js/shared";
import { CoverageCollection, CoverageJSON } from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";
import { isCoverageCollection } from "@/utils/isTypeObject";
import { TCoverageLabel, TWrappedCoverage } from "./types";

const parseParamIds = (params?: IRequestParams) =>
  params?.["parameter-name"]?.split(",").filter(Boolean) ?? [];

const isSubset = (a: string[], b: string[]) => a.every((x) => b.includes(x));

const sameDatetime = (a?: string | null, b?: string | null) =>
  (a ?? null) === (b ?? null);

export const findReusableCoverage = (
  data: TWrappedCoverage[],
  locationId: string,
  currentDatetime: string | null | undefined,
  currentParamIds: string[],
): TWrappedCoverage | undefined => {
  return data.find(
    (w) =>
      w.locationId === locationId &&
      sameDatetime(w.params?.datetime, currentDatetime) &&
      isSubset(currentParamIds, parseParamIds(w.params)),
  );
};

export const findStaleCoverage = (
  entries: Array<{ locationId: string; createdAt: number }>,
  activeLocationIds: string[],
  maxKeep: number,
): string[] => {
  // Redundant but keeping for extra hardening
  const active = new Set(activeLocationIds);

  const stale = entries.filter((e) => !active.has(e.locationId));

  if (stale.length <= maxKeep) {
    return [];
  }

  // Oldest first
  stale.sort((a, b) => a.createdAt - b.createdAt);

  // Return location IDs for the oldest coverages
  const toDropCount = stale.length - maxKeep;
  return stale.slice(0, toDropCount).map((e) => e.locationId);
};

// Validate a single coverage
export const isValid = (coverage: CoverageCollection | CoverageJSON) => {
  if (isCoverageCollection(coverage) && coverage.coverages.length === 0) {
    return false;
  }
  return true;
};

export const computeCoverageLabel = (
  locationId: TLocation["id"],
  index: number,
  coverage: CoverageCollection | CoverageJSON,
  coverageLabels?: TCoverageLabel,
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
