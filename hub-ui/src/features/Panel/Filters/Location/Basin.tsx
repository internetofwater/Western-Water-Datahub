import { useEffect, useRef, useState } from 'react';
import { FeatureCollection, Polygon } from 'geojson';
import { ComboboxData, Select, Skeleton } from '@mantine/core';
import { SourceId } from '@/features/Map/sources';
import geoconnexService from '@/services/init/geoconnex.init';
import { Huc02BasinProperties, Huc02Field } from '@/types/huc02';
import { formatOptions } from '../utils';

export const Basin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [basinOptions, setBasinOptions] = useState<ComboboxData>([]);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getBasinOptions = async () => {
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
          setLoading(false);
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
        controller.current.abort('Component unmount');
      }
    };
  }, []);

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={loading || basinOptions.length === 0}
    >
      <Select size="xs" label="Basin" placeholder="Select..." data={basinOptions} searchable />
    </Skeleton>
  );
};
