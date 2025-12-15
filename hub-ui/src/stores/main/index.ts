/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from 'dayjs';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createCollectionSlice } from '@/stores/main/slices/collections';
import { createLocationSlice } from '@/stores/main/slices/locations';
import { MainState } from '@/stores/main/types';
import { createLayerSlice } from './slices/layers';
import { createParametersSlice } from './slices/parameters';

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
    selectedCollections: [],
    setSelectedCollections: (selectedCollections) =>
      set((state) => {
        state.selectedCollections = selectedCollections;
      }),
    geographyFilter: null,
    setGeographyFilter: (filter) =>
      set((state) => {
        state.geographyFilter = filter;
      }),
    hasGeographyFilter: () => Boolean(get().geographyFilter),
    from: dayjs().subtract(1, 'week').format('YYYY-MM-DD'),
    setFrom: (from) =>
      set((state) => {
        state.from = from;
      }),
    to: dayjs().format('YYYY-MM-DD'),
    setTo: (to) =>
      set((state) => {
        state.to = to;
      }),
    ...createCollectionSlice(set, get, store),
    ...createLayerSlice(set, get, store),
    ...createLocationSlice(set, get, store),
    ...createParametersSlice(set, get, store),
  }))
);

export default useMainStore;
