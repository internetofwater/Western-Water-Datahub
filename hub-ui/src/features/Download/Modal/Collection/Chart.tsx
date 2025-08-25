import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@mantine/core';
import LineChart from '@/components/Charts/LineChart';
import styles from '@/features/Download/Download.module.css';
import { getDatetime } from '@/features/Download/Modal/utils';
import loadingManager from '@/managers/Loading.init';
import notificationManager from '@/managers/Notification.init';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';
import wwdhService from '@/services/init/wwdh.init';
import { Collection, Location } from '@/stores/main/types';
import { NotificationType } from '@/stores/session/types';

type Props = {
  instanceId: number;
  collectionId: Collection['id'];
  locationId: Location['id'];
  parameters: string[];
  from: string | null;
  to: string | null;
};

export const Chart: React.FC<Props> = (props) => {
  const { instanceId, collectionId, locationId, parameters, from, to } = props;

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const [data, setData] = useState<CoverageCollection | CoverageJSON | null>(null);

  const fetchData = async () => {
    const loadingInstance = loadingManager.add('Fetching basin dropdown options');
    try {
      controller.current = new AbortController();

      const datetime = getDatetime(from, to);

      const coverageCollection = await wwdhService.getLocation<CoverageCollection | CoverageJSON>(
        collectionId,
        String(locationId),
        {
          signal: controller.current.signal,
          params: {
            'parameter-name': parameters.join(','),
            ...(datetime ? { datetime } : {}),
          },
        }
      );

      if (isMounted.current) {
        loadingManager.remove(loadingInstance);
        setData(coverageCollection);
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
    setData(null);
    void fetchData();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort('Component unmount');
      }
    };
  }, [instanceId]);

  return (
    <Skeleton
      height={55} // Default dimensions of select
      visible={!data}
      className={styles.chartWrapper}
    >
      {data && (
        <LineChart
          data={data}
          title={String(locationId)}
          legend
          legendEntries={parameters}
          filename={`line-chart-${locationId}-${parameters.join('-')}`}
        />
      )}
    </Skeleton>
  );
};
