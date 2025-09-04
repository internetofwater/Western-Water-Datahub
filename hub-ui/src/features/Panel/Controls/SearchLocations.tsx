/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Tooltip } from "@mantine/core";
import { useLoading } from "@/hooks/useLoading";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import useMainStore from "@/stores/main";
import { LoadingType, NotificationType } from "@/stores/session/types";

export const SearchLocations: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const collection = useMainStore((state) => state.collection);

  const { isLoadingGeography, isFetchingCollections, isFetchingLocations } =
    useLoading();

  const addData = async () => {
    const loadingInstance = loadingManager.add(
      "Fetching Locations",
      LoadingType.Locations,
    );
    try {
      await mainManager.getLocations();
      loadingManager.remove(loadingInstance);
      notificationManager.show("Done fetching data", NotificationType.Success);
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          NotificationType.Error,
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

    if (!(provider || collection)) {
      return "Please select a provider or collection";
    }
  };

  return (
    <>
      {!isFetchingLocations &&
      !isFetchingCollections &&
      !isLoadingGeography &&
      (provider || collection) ? (
        <Button onClick={() => void addData()}>Search Locations</Button>
      ) : (
        <Tooltip label={getLabel()}>
          <Button data-disabled onClick={(event) => event.preventDefault()}>
            Search Locations
          </Button>
        </Tooltip>
      )}
    </>
  );
};
