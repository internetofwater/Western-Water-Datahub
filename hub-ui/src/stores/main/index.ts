/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MainState } from '@/stores/main/types';
import { createCollectionSlice } from './slices/collections';
import { createLocationSlice } from './slices/locations';

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
    dataset: null,
    setDataset: (dataset) =>
      set((state) => {
        state.dataset = dataset;
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
