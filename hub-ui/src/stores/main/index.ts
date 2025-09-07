/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createCollectionSlice } from '@/stores/main/slices/collections';
import { createLocationSlice } from '@/stores/main/slices/locations';
import { MainState } from '@/stores/main/types';

const useMainStore = create<MainState>()(
  immer((set, get, store) => ({
    provider: null,
    setProvider: (provider) =>
      set((state) => {
        state.provider = provider;
      }),
    category: null,
    setCategory: (category) =>
      set((state) => {
        state.category = category;
      }),
    collection: null,
    setCollection: (collection) =>
      set((state) => {
        state.collection = collection;
      }),
    geographyFilter: null,
    setGeographyFilter: (filter) =>
      set((state) => {
        state.geographyFilter = filter;
      }),
    hasGeographyFilter: () => Boolean(get().geographyFilter),

    ...createCollectionSlice(set, get, store),
    ...createLocationSlice(set, get, store),
  }))
);

export default useMainStore;
