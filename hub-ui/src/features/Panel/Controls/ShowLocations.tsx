/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useRef, useState } from "react";
import { Button, Text } from "@mantine/core";
import Tooltip from "@/components/Tooltip";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import { useMap } from "@/contexts/MapContexts";
import { MAP_ID } from "@/features/Map/config";
import { useLoading } from "@/hooks/useLoading";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { ELoadingType, ENotificationType, ETool } from "@/stores/session/types";
import { CollectionType, getCollectionType } from "@/utils/collection";

dayjs.extend(isSameOrBefore);

export const ShowLocations: React.FC = () => {
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const from = useMainStore((state) => state.from);
  const to = useMainStore((state) => state.to);
  const setOpenTools = useSessionStore((state) => state.setOpenTools);
  const geographyFilterItemId = useMainStore(
    (state) => state.geographyFilter?.itemId,
  );

  const parameters = useMainStore((state) => state.parameters);

  const { isLoadingGeography, isFetchingCollections, isFetchingLocations } =
    useLoading();

  const isFirstTime = useRef(true);

  const [isDisabled, setIsDisabled] = useState(true);

  const { persistentPopup } = useMap(MAP_ID);

  useEffect(() => {
    const isLoading =
      isLoadingGeography || isFetchingCollections || isFetchingLocations;
    const noCollectionsSelected = selectedCollections.length === 0;

    const hasFrom = Boolean(from);
    const hasTo = Boolean(to);

    const fromIsValid = hasFrom && dayjs(from).isValid();
    const toIsValid = hasTo && dayjs(to).isValid();
    const bothValid = fromIsValid && toIsValid;

    const df = bothValid ? dayjs(from) : null;
    const dt = bothValid ? dayjs(to) : null;

    const validRange = bothValid ? df!.isSameOrBefore(dt!) : true;

    const diffDays = bothValid && validRange ? dt!.diff(df!, "day") : null;

    const checkCollectionRestictions = (collectionId: string): boolean => {
      const collection = mainManager.getCollection(collectionId);
      if (!collection) {
        return false;
      }

      const restrictions = CollectionRestrictions[collectionId];
      if (!restrictions) {
        return false;
      }

      const collectionType = getCollectionType(collection);
      const collectionParameters = parameters.find(
        (p) => p.collectionId === collectionId,
      );

      // Parameter restriction
      let isInvalidParameter = false;
      const parameterRestriction = restrictions.find(
        (r) => r.type === RestrictionType.Parameter,
      );
      if (parameterRestriction && parameterRestriction.count > 0) {
        isInvalidParameter =
          !collectionParameters ||
          collectionParameters.parameters.length > parameterRestriction.count;
      }

      let isInvalidDate = false;
      const daysRestiction = restrictions.find(
        (r) => r.type === RestrictionType.Day,
      );
      if (daysRestiction && daysRestiction.days > 0) {
        isInvalidDate =
          !bothValid ||
          !validRange ||
          (diffDays !== null && diffDays > daysRestiction.days);
      }

      // Geography filter restriction
      let isInvalidGeographyFilter = false;
      const geoRestriction = restrictions.find(
        (r) => r.type === RestrictionType.GeographyFilter,
      );
      if (geoRestriction) {
        isInvalidGeographyFilter = !geographyFilterItemId;
      }

      // EDRGrid requires parameters
      const isEdrGridMissingParam =
        collectionType === CollectionType.EDRGrid &&
        (!collectionParameters || collectionParameters.parameters.length === 0);

      return (
        isInvalidParameter ||
        isInvalidDate ||
        isInvalidGeographyFilter ||
        isEdrGridMissingParam
      );
    };

    // If both dates exist but ordering is invalid, disable regardless of collections
    const orderingDisabled = bothValid && !validRange;

    const anyCollectionDisables =
      !isLoading &&
      !noCollectionsSelected &&
      selectedCollections.some((id) => checkCollectionRestictions(id));

    const nextDisabled =
      isLoading ||
      noCollectionsSelected ||
      orderingDisabled ||
      anyCollectionDisables;

    setIsDisabled(nextDisabled);
  }, [
    selectedCollections,
    parameters,
    from,
    to,
    geographyFilterItemId,
    isLoadingGeography,
    isFetchingCollections,
    isFetchingLocations,
    mainManager,
  ]);

  // useEffect(() => {
  //   selectedCollections.forEach((collectionId) => {
  //     const restrictions = CollectionRestrictions[collectionId];

  //   });
  // }, [selectedCollections, from, to]);

  // useEffect(() => {
  //   selectedCollections.forEach((collectionId) => {
  //     const restrictions = CollectionRestrictions[collectionId];

  //     if (restrictions && restrictions.length > 0) {
  //       const geoRestriction = restrictions.find(
  //         (restriction) => restriction.type === RestrictionType.GeographyFilter
  //       );

  //       if (geoRestriction) {
  //         setIsDisabled(!geographyFilterItemId);
  //       }
  //     }
  //   });
  // }, [selectedCollections, geographyFilterItemId]);

  // useEffect(() => {
  //   setIsDisabled(
  //     isLoadingGeography ||
  //       isFetchingCollections ||
  //       isFetchingLocations ||
  //       selectedCollections.length === 0
  //   );
  // }, [isLoadingGeography, isFetchingCollections, isFetchingLocations, selectedCollections]);

  const addData = async () => {
    // User has a popup open that may not be relevant any longer
    if (persistentPopup && persistentPopup.isOpen()) {
      persistentPopup.remove();
    }

    const loadingInstance = loadingManager.add(
      "Fetching Locations",
      ELoadingType.Locations,
    );
    try {
      await mainManager.createLayer();
      loadingManager.remove(loadingInstance);
      if (isFirstTime.current) {
        isFirstTime.current = false;
        setOpenTools(ETool.Legend, true);
      }
      notificationManager.show("Done fetching data", ENotificationType.Success);
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
          10000,
        );
      }
      loadingManager.remove(loadingInstance);
    }
  };

  const getLabel = () => {
    if (isLoadingGeography) {
      return "Please wait for geography filter to load";
    }

    if (isFetchingCollections) {
      return "Please wait for collections request to complete";
    }

    if (isFetchingLocations) {
      return "Please wait for locations request to complete";
    }

    if (selectedCollections.length === 0) {
      return "Please select at least one collection";
    }

    if (isDisabled) {
      return "Please correct the issues above.";
    }

    return (
      <>
        <Text size="sm">Show locations for all selected collections.</Text>
        <br />
        <Text size="sm">
          Access scientific measurements, place names, and other data points
          through location shapes on the map.
        </Text>
      </>
    );

    ("");
  };

  return (
    <Tooltip multiline label={getLabel()}>
      <Button
        disabled={isDisabled}
        data-disabled={isDisabled}
        onClick={() => void addData()}
      >
        Show Locations
      </Button>
    </Tooltip>
  );
};
