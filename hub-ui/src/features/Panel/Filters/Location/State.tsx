/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { FeatureCollection, Polygon } from "geojson";
import { ComboboxData, Select, Skeleton } from "@mantine/core";
import { ValidStates } from "@/features/Map/consts";
import { SourceId } from "@/features/Map/sources";
import geoconnexService from "@/services/init/geoconnex.init";
import { StateField, StateProperties } from "@/types/state";
import { formatOptions } from "../utils";

export const State: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stateOptions, setStateOptions] = useState<ComboboxData>([]);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getBasinOptions = async () => {
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
          (feature) => String(feature?.properties?.[StateField.Acronym]),
          (feature) => String(feature?.properties?.[StateField.Name]),
          "All States",
        );

        if (isMounted.current) {
          setLoading(false);
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
        console.error(_error);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getBasinOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={loading || stateOptions.length === 0}
    >
      <Select
        size="xs"
        label="State"
        placeholder="Select..."
        data={stateOptions}
        searchable
      />
    </Skeleton>
  );
};
