/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider, ProviderDatasources } from '@/consts/collections';
import { ICollection } from '@/services/edr.service';

export const getProvider = (collectionId: ICollection['id']): string => {
  if (ProviderDatasources[Provider.USBR].includes(collectionId)) {
    return Provider.USBR.toUpperCase();
  }
  if (ProviderDatasources[Provider.USDA].includes(collectionId)) {
    return Provider.USDA.toUpperCase();
  }
  if (ProviderDatasources[Provider.USGS].includes(collectionId)) {
    return Provider.USGS.toUpperCase();
  }
  if (ProviderDatasources[Provider.USACE].includes(collectionId)) {
    return Provider.USACE.toUpperCase();
  }

  return '';
};
