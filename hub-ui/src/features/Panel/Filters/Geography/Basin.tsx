/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from 'react';
import { FeatureCollection, Polygon } from 'geojson';
import { ComboboxData, Select, Skeleton } from '@mantine/core';
import { SourceId } from '@/features/Map/sources';
import { formatOptions } from '@/features/Panel/Filters/utils';
import loadingManager from '@/managers/Loading.init';
import mainManager from '@/managers/Main.init';
import notificationManager from '@/managers/Notification.init';
import geoconnexService from '@/services/init/geoconnex.init';
import useMainStore from '@/stores/main';
import { NotificationType } from '@/stores/session/types';
import { Huc02BasinProperties, Huc02Field } from '@/types/huc02';

export const Basin: React.FC = () => {
  const geographyFilterCollectionId = useMainStore((state) => state.geographyFilter?.collectionId);
  const geographyFilterItemId = useMainStore((state) => state.geographyFilter?.itemId);

  const [basinOptions, setBasinOptions] = useState<ComboboxData>([]);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getBasinOptions = async () => {
    const loadingInstance = loadingManager.add('Fetching basin dropdown options');

    try {
      controller.current = new AbortController();

      const basinFeatureCollection = await geoconnexService.getItems<
        FeatureCollection<Polygon, Huc02BasinProperties>
      >(SourceId.Huc02, {
        params: {
          bbox: [-125, 24, -96.5, 49],
          skipGeometry: true,
        },
      });

      if (basinFeatureCollection.features.length) {
        const basinOptions = formatOptions(
          basinFeatureCollection.features,
          (feature) => String(feature.id),
          (feature) => String(feature?.properties?.[Huc02Field.Name])
        );

        if (isMounted.current) {
          loadingManager.remove(loadingInstance);
          setBasinOptions(basinOptions);
        }
      }
    } catch (error) {
      if (
        (error as Error)?.name === 'AbortError' ||
        (typeof error === 'string' && error === 'Component unmount')
      ) {
        console.log('Fetch request canceled');
      } else if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(`Error: ${_error.message}`, NotificationType.Error);
      }
      loadingManager.remove(loadingInstance);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getBasinOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort('Component unmount');
      }
    };
  }, []);

  const handleChange = async (itemId: string | null) => {
    if (itemId) {
      const loadingInstance = loadingManager.add('Adding basin geography filter');
      await mainManager.updateGeographyFilter(SourceId.Huc02, itemId);
      loadingManager.remove(loadingInstance);
      notificationManager.show('Updated geography filter', NotificationType.Success);
    }
  };

  const handleClear = () => {
    mainManager.removeGeographyFilter();
  };

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={basinOptions.length === 0}
    >
      <Select
        key={`basin-select-${geographyFilterCollectionId}`}
        size="sm"
        label="Basin"
        placeholder="Select..."
        data={basinOptions}
        value={
          geographyFilterCollectionId === SourceId.Huc02 && geographyFilterItemId
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
