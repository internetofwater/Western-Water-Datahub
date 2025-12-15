/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { MainState, TLocation } from "@/stores/main/types";

export interface ILocationSlice {
  locations: TLocation[];
  setLocations: (locations: TLocation[]) => void;
  addLocation: (location: TLocation) => void;
  removeLocation: (locationId: TLocation["id"]) => void;
  hasLocation: (locationId: TLocation["id"]) => boolean;
}

export const createLocationSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  ILocationSlice
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
