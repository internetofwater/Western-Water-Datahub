/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useCallback, useMemo } from "react";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import { useLoading } from "@/hooks/useLoading";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { CollectionType, getCollectionType } from "@/utils/collection";

dayjs.extend(isSameOrBefore);

type CheckDateFn = (days: number) => boolean;

export const useValidation = (collectionId: ICollection["id"]) => {
  // Global store selectors
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const from = useMainStore((state) => state.from);
  const to = useMainStore((state) => state.to);
  const parameters = useMainStore((state) => state.parameters);
  const geographyFilterItemId = useMainStore(
    (state) => state.geographyFilter?.itemId,
  );

  const { isLoadingGeography, isFetchingCollections, isFetchingLocations } =
    useLoading();

  // Consolidated loading flag
  const isLoading =
    isLoadingGeography || isFetchingCollections || isFetchingLocations;

  // Recompute date logic only when to or from have changed
  const {
    orderingInvalid,
    isDateOverLimit, // Helper function for is date restrictions exist
  } = useMemo(() => {
    const hasFrom = Boolean(from);
    const hasTo = Boolean(to);

    const fromIsValid = hasFrom && dayjs(from).isValid();
    const toIsValid = hasTo && dayjs(to).isValid();
    const bothValidLocal = fromIsValid && toIsValid;

    const df = bothValidLocal ? dayjs(from) : null;
    const dt = bothValidLocal ? dayjs(to) : null;

    const validRangeLocal = bothValidLocal ? df!.isSameOrBefore(dt!) : true;
    const diffDays =
      bothValidLocal && validRangeLocal ? dt!.diff(df!, "day") : null;

    const isDateOverLimitLocal: CheckDateFn = (days: number) => {
      // If dates are missing or invalidly ordered, treat as over-limit
      if (!bothValidLocal || !validRangeLocal) {
        return true;
      }
      if (diffDays === null) {
        return true;
      }
      return diffDays > days;
    };

    const orderingInvalidLocal = bothValidLocal && !validRangeLocal;

    return {
      bothValid: bothValidLocal,
      validRange: validRangeLocal,
      orderingInvalid: orderingInvalidLocal,
      isDateOverLimit: isDateOverLimitLocal,
    };
  }, [from, to]);

  const checkCollectionRestrictions = useCallback(
    (id: string, checkDate: CheckDateFn): boolean => {
      const collection = mainManager.getCollection(id);
      if (!collection) {
        return false;
      }

      const restrictions = CollectionRestrictions[id];
      if (!restrictions) {
        return false;
      }

      const collectionType = getCollectionType(collection);
      const collectionParams = parameters.find((p) => p.collectionId === id);

      // Parameter restriction
      const paramRule = restrictions.find(
        (r) => r.type === RestrictionType.Parameter,
      );
      const hasParamLimit =
        !!paramRule &&
        typeof paramRule.count === "number" &&
        paramRule.count > 0;
      const paramCount = collectionParams?.parameters?.length ?? 0;
      const isInvalidParameter = hasParamLimit && paramCount > paramRule!.count;

      // Date range restriction (days)
      const dayRule = restrictions.find((r) => r.type === RestrictionType.Day);
      const hasDayLimit =
        !!dayRule && typeof dayRule.days === "number" && dayRule.days > 0;
      const isInvalidDate = hasDayLimit ? checkDate(dayRule!.days) : false;

      // Geography filter restriction
      const geoRule = restrictions.find(
        (r) => r.type === RestrictionType.GeographyFilter,
      );
      const isInvalidGeographyFilter = !!geoRule && !geographyFilterItemId;

      // EDRGrid requires at least one parameter
      const isEdrGridMissingParam =
        collectionType === CollectionType.EDRGrid && paramCount === 0;

      return (
        isInvalidParameter ||
        isInvalidDate ||
        isInvalidGeographyFilter ||
        isEdrGridMissingParam
      );
    },
    [parameters, geographyFilterItemId],
  );

  const hasParameterRestrictions = useCallback(
    (id: ICollection["id"] = collectionId) => {
      const collection = mainManager.getCollection(id);
      if (!collection) {
        return false;
      }

      const restrictions = CollectionRestrictions[id];
      if (!restrictions) {
        return false;
      }

      const paramRule = restrictions.find(
        (r) => r.type === RestrictionType.Parameter,
      );

      return (
        !!paramRule &&
        typeof paramRule.count === "number" &&
        paramRule.count > 0
      );
    },
    [collectionId],
  );

  const hasDateRangeRestrictions = useCallback(
    (id: ICollection["id"] = collectionId) => {
      const collection = mainManager.getCollection(id);
      if (!collection) {
        return false;
      }

      const restrictions = CollectionRestrictions[id];
      if (!restrictions) {
        return false;
      }

      const dayRule = restrictions.find((r) => r.type === RestrictionType.Day);
      return !!dayRule && typeof dayRule.days === "number" && dayRule.days > 0;
    },
    [collectionId],
  );

  const hasGeoFilterRestrictions = useCallback(
    (id: ICollection["id"] = collectionId) => {
      const collection = mainManager.getCollection(id);
      if (!collection) {
        return false;
      }

      const restrictions = CollectionRestrictions[id];
      if (!restrictions) {
        return false;
      }

      const geoRule = restrictions.find(
        (r) => r.type === RestrictionType.GeographyFilter,
      );
      return !!geoRule && !geographyFilterItemId;
    },
    [collectionId],
  );

  const { isCollectionValid, areAllValid } = useMemo(() => {
    const noCollectionsSelected = selectedCollections.length === 0;

    // If both dates exist but ordering is invalid, disable regardless of collections
    const orderingDisabled = orderingInvalid;

    // Individual collection validation
    const collectionDisabled =
      !isLoading && checkCollectionRestrictions(collectionId, isDateOverLimit);

    const singleDisabled =
      isLoading ||
      noCollectionsSelected ||
      orderingDisabled ||
      collectionDisabled;

    // Group validation (any selected collection disables)
    const anyCollectionDisables =
      !isLoading &&
      !noCollectionsSelected &&
      selectedCollections.some((id) =>
        checkCollectionRestrictions(id, isDateOverLimit),
      );

    const groupDisabled =
      isLoading ||
      noCollectionsSelected ||
      orderingDisabled ||
      anyCollectionDisables;

    return {
      isCollectionValid: !singleDisabled,
      areAllValid: !groupDisabled,
    };
  }, [
    isLoading,
    selectedCollections,
    collectionId,
    orderingInvalid,
    isDateOverLimit,
    checkCollectionRestrictions,
  ]);

  return {
    isCollectionValid,
    areAllValid,
    hasParameterRestrictions,
    hasDateRangeRestrictions,
    hasGeoFilterRestrictions,
  };
};
