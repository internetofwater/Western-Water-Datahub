/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { FeatureCollection, Polygon } from "geojson";
import { ComboboxData, Select, Skeleton } from "@mantine/core";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import { ValidRegions } from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import { formatOptions } from "@/features/Panel/Filters/utils";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import wwdhService from "@/services/init/wwdh.init";
import useMainStore from "@/stores/main";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { RegionField, RegionProperties } from "@/types/region";

export const Region: React.FC = () => {
  const geographyFilterCollectionId = useMainStore(
    (state) => state.geographyFilter?.collectionId,
  );
  const geographyFilterItemId = useMainStore(
    (state) => state.geographyFilter?.itemId,
  );

  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );

  const [regionOptions, setRegionOptions] = useState<ComboboxData>([]);
  const [isRequired, setIsRequired] = useState(false);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getRegionOptions = async () => {
    const loadingInstance = loadingManager.add(
      "Fetching region dropdown options",
      ELoadingType.Data,
    );

    try {
      controller.current = new AbortController();

      const regionFeatureCollection = await wwdhService.getItems<
        FeatureCollection<Polygon, RegionProperties>
      >(SourceId.DoiRegions, {
        params: {
          bbox: [-125, 24, -96.5, 49],
          skipGeometry: true,
        },
      });

      if (regionFeatureCollection.features.length) {
        const regionOptions = formatOptions(
          regionFeatureCollection.features.filter((feature) =>
            ValidRegions.includes(String(feature.id)),
          ),
          (feature) => String(feature.id),
          (feature) => String(feature?.properties?.[RegionField.Name]),
        );

        if (isMounted.current) {
          loadingManager.remove(loadingInstance);
          setRegionOptions(regionOptions);
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
          ENotificationType.Error,
          10000,
        );
      }
      loadingManager.remove(loadingInstance);
    }
  };
  useEffect(() => {
    isMounted.current = true;
    void getRegionOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  useEffect(() => {
    let noRestrictions = true;

    selectedCollections.forEach((collectionId) => {
      const restrictions = CollectionRestrictions[collectionId];

      if (restrictions && restrictions.length > 0) {
        const geoRestriction = restrictions.find(
          (restriction) => restriction.type === RestrictionType.GeographyFilter,
        );

        if (geoRestriction) {
          setIsRequired(true);
          noRestrictions = false;
        }
      }
    });
    if (noRestrictions) {
      setIsRequired(false);
    }
  }, [selectedCollections]);

  const handleChange = async (itemId: string | null) => {
    if (itemId) {
      const loadingInstance = loadingManager.add(
        "Adding region geography filter",
        ELoadingType.Geography,
      );
      try {
        await mainManager.updateGeographyFilter(SourceId.DoiRegions, itemId);
        loadingManager.remove(loadingInstance);
        notificationManager.show(
          "Updated geography filter",
          ENotificationType.Success,
        );
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
    }
  };

  const handleClear = () => {
    mainManager.removeGeographyFilter();
  };

  const getError = () => {
    if (
      isRequired &&
      !(
        geographyFilterCollectionId === SourceId.DoiRegions &&
        geographyFilterItemId
      )
    ) {
      return "Please select a geographic filter";
    }

    return undefined;
  };

  return (
    <Skeleton
      height={getError() ? 70 : 55}
      visible={regionOptions.length === 0}
    >
      <Select
        key={`region-select-${geographyFilterCollectionId}`}
        size="sm"
        label="Region"
        placeholder="Select..."
        data={regionOptions}
        value={
          geographyFilterCollectionId === SourceId.DoiRegions &&
          geographyFilterItemId
            ? geographyFilterItemId
            : undefined
        }
        onChange={(value) => handleChange(value)}
        onClear={() => handleClear()}
        searchable
        clearable
        error={getError()}
        withAsterisk={isRequired}
      />
    </Skeleton>
  );
};
