/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from 'zustand';
import { ICollection } from '@/services/edr.service';
import { MainState } from '../types';

interface CollectionSlice {
  collections: ICollection[];
  setCollections: (collections: ICollection[]) => void;
  addCollection: (collection: ICollection) => void;
  hasCollection: (collectionId: string) => boolean;
}

export const createCollectionSlice: StateCreator<
  MainState,
  [['zustand/immer', never]],
  [],
  CollectionSlice
> = (set, get) => ({
  collections: [],
  setCollections: (collections) =>
    set((state) => {
      state.collections = collections;
    }),
  addCollection: (collection) =>
    set((state) => {
      state.collections.push(collection);
    }),
  hasCollection: (collectionId) => get().collections.some((c) => c.id === collectionId),
});
