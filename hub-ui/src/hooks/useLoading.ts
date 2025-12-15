/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import loadingManager from '@/managers/Loading.init';
import useSessionStore from '@/stores/session';
import { ELoadingType } from '@/stores/session/types';

export const useLoading = () => {
  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const [isLoadingGeography, setIsLoadingGeography] = useState(false);
  const [isFetchingCollections, setIsFetchingCollections] = useState(false);
  const [isFetchingLocations, setIsFetchingLocations] = useState(false);

  useEffect(() => {
    setIsFetchingLocations(loadingManager.has({ type: ELoadingType.Locations }));
    setIsFetchingCollections(loadingManager.has({ type: ELoadingType.Collections }));
    setIsLoadingGeography(loadingManager.has({ type: ELoadingType.Geography }));
  }, [loadingInstances]);

  return {
    isLoadingGeography,
    isFetchingCollections,
    isFetchingLocations,
  };
};
