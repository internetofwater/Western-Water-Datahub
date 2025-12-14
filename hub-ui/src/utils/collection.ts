/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatasourceCollectionType } from '@/consts/collections';
import { ICollection } from '@/services/edr.service';

// This is non-exhaustive, reflects currently supported types
export enum CollectionType {
  EDR = 'edr',
  EDRGrid = 'edr-grid',
  Features = 'features',
  Unknown = 'unknown',
  Map = 'map',
}

export const isEdr = (collection: ICollection): boolean => {
  return (
    collection.data_queries &&
    Object.keys(collection.data_queries).some((query) => query === 'locations')
  );
};

export const isEdrGrid = (collection: ICollection): boolean => {
  if (!collection.data_queries) {
    return false;
  }

  const queries = Object.keys(collection.data_queries);
  return (
    queries.every((query) => query !== 'locations') && queries.some((query) => query === 'cube')
  );
};

export const isMap = (collection: ICollection): boolean => {
  return collection.links.some((link) => link.rel.includes('map') && link.type === 'image/png');
};

export const isFeatures = (collection: ICollection): boolean => {
  return Boolean(collection?.itemType) && collection.itemType === 'feature';
};

export const getCollectionTypeDefaults = (
  collectionId: ICollection['id']
): CollectionType | undefined => {
  if (DatasourceCollectionType[CollectionType.EDRGrid].includes(collectionId)) {
    return CollectionType.EDRGrid;
  }
  if (DatasourceCollectionType[CollectionType.EDR].includes(collectionId)) {
    return CollectionType.EDR;
  }
  if (DatasourceCollectionType[CollectionType.Features].includes(collectionId)) {
    return CollectionType.Features;
  }
};

export const getCollectionType = (collection: ICollection): CollectionType => {
  const defaultCollectionType = getCollectionTypeDefaults(collection.id);

  if (defaultCollectionType) {
    return defaultCollectionType;
  }

  if (isEdr(collection)) {
    return CollectionType.EDR;
  }

  if (isEdrGrid(collection)) {
    return CollectionType.EDRGrid;
  }

  if (isFeatures(collection)) {
    return CollectionType.Features;
  }

  if (isMap(collection)) {
    return CollectionType.Map;
  }

  return CollectionType.Unknown;
};
