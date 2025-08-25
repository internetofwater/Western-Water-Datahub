/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import { ComboboxData, Select, Skeleton } from "@mantine/core";
import esriService from "@/services/init/esri.init";
import { RegionField } from "@/types/region";
import { formatOptions } from "../utils";

export const Region: React.FC = () => {
  const [regionOptions, setRegionOptions] = useState<ComboboxData>([]);
  const [loading, setLoading] = useState(true);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const getRegionOptions = async () => {
    try {
      controller.current = new AbortController();

      const regionFeatureCollection = await esriService.getFeatures(
        controller.current.signal,
      );

      if (regionFeatureCollection.features.length) {
        const regionOptions = formatOptions(
          regionFeatureCollection.features,
          (feature) => String(feature?.properties?.[RegionField.Name]),
          (feature) => String(feature?.properties?.[RegionField.Name]),
        );

        if (isMounted.current) {
          setLoading(false);
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
        console.error(_error);
      }
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

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={loading || regionOptions.length === 0}
    >
      <Select
        size="xs"
        label="Region"
        placeholder="Select..."
        data={regionOptions}
        searchable
      />
    </Skeleton>
  );
};
