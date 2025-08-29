/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { FeatureCollection, Polygon } from "geojson";
import { ComboboxData, Select, Skeleton } from "@mantine/core";
import { ValidStates } from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import { formatOptions } from "@/features/Panel/Filters/utils";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import geoconnexService from "@/services/init/geoconnex.init";
import useMainStore from "@/stores/main";
import { NotificationType } from "@/stores/session/types";
import { StateField, StateProperties } from "@/types/state";

export const State: React.FC = () => {
  const geographyFilterCollectionId = useMainStore(
    (state) => state.geographyFilter?.collectionId,
  );
  const geographyFilterItemId = useMainStore(
    (state) => state.geographyFilter?.itemId,
  );

  const [stateOptions, setStateOptions] = useState<ComboboxData>([]);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getStateOptions = async () => {
    const loadingInstance = loadingManager.add(
      "Fetching state dropdown options",
    );
    try {
      controller.current = new AbortController();

      const stateFeatureCollection = await geoconnexService.getItems<
        FeatureCollection<Polygon, StateProperties>
      >(SourceId.States, {
        params: {
          bbox: [-125, 24, -96.5, 49],
          skipGeometry: true,
        },
      });

      if (stateFeatureCollection.features.length) {
        const basinOptions = formatOptions(
          stateFeatureCollection.features.filter((feature) =>
            ValidStates.includes(feature.properties[StateField.Acronym]),
          ),
          (feature) => String(feature?.id),
          (feature) => String(feature?.properties?.[StateField.Name]),
          "All States",
        );

        if (isMounted.current) {
          loadingManager.remove(loadingInstance);
          setStateOptions(basinOptions);
        }
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
        );
      }
      loadingManager.remove(loadingInstance);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getStateOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  const handleChange = async (itemId: string | null) => {
    if (itemId) {
      const loadingInstance = loadingManager.add(
        "Adding state geography filter",
      );
      await mainManager.updateGeographyFilter(SourceId.States, itemId);
      loadingManager.remove(loadingInstance);
      notificationManager.show(
        "Updated geography filter",
        NotificationType.Success,
      );
    }
  };

  const handleClear = () => {
    mainManager.removeGeographyFilter();
  };

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={stateOptions.length === 0}
    >
      <Select
        key={`state-select-${geographyFilterCollectionId}`}
        size="sm"
        label="State"
        placeholder="Select..."
        data={stateOptions}
        value={
          geographyFilterCollectionId === SourceId.States &&
          geographyFilterItemId
            ? geographyFilterItemId
            : undefined
        }
        onChange={(value) => handleChange(value)}
        onClear={() => handleClear()}
        searchable
        clearable
      />
    </Skeleton>
  );
};
