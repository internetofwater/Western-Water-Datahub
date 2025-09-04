import { useEffect, useState } from 'react';
import loadingManager from '@/managers/Loading.init';
import useSessionStore from '@/stores/session';
import { LoadingType } from '@/stores/session/types';

export const useLoading = () => {
  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const [isLoadingGeography, setIsLoadingGeography] = useState(false);
  const [isFetchingCollections, setIsFetchingCollections] = useState(false);
  const [isFetchingLocations, setIsFetchingLocations] = useState(false);

  useEffect(() => {
    setIsFetchingLocations(loadingManager.has({ type: LoadingType.Locations }));
    setIsFetchingCollections(loadingManager.has({ type: LoadingType.Collections }));
    setIsLoadingGeography(loadingManager.has({ type: LoadingType.Geography }));
  }, [loadingInstances]);

  return {
    isLoadingGeography,
    isFetchingCollections,
    isFetchingLocations,
  };
};
