/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from 'zustand';
import { Location, MainState } from '@/stores/main/types';

interface LocationSlice {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  removeLocation: (locationId: Location['id']) => void;
  hasLocation: (locationId: Location['id']) => boolean;
}

export const createLocationSlice: StateCreator<
  MainState,
  [['zustand/immer', never]],
  [],
  LocationSlice
> = (set, get) => ({
  locations: [],
  setLocations: (locations) =>
    set((state) => {
      state.locations = locations;
    }),
  addLocation: (location) =>
    set((state) => {
      state.locations.push(location);
    }),
  removeLocation: (id) =>
    set((state) => {
      state.locations = state.locations.filter((loc) => loc.id !== id);
    }),
  hasLocation: (locationId) => get().locations.some((l) => l.id === locationId),
});
