/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { ICollection } from "@/services/edr.service";
import { MainState, TSearch } from "@/stores/main/types";

export interface ISearchSlice {
  searches: TSearch[];
  setSearches: (searches: TSearch[]) => void;
  addSearch: (
    collectionId: ICollection["id"],
    searchTerm: string,
    matchedLocations: string[],
  ) => void;
  removeSearch: (collectionId: ICollection["id"]) => void;
  hasSearch: (collectionId: ICollection["id"]) => boolean;
}

export const createSearchSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  ISearchSlice
> = (set, get) => ({
  searches: [],
  setSearches: (searches) =>
    set((state) => {
      state.searches = searches;
    }),
  addSearch: (collectionId, searchTerm, matchedLocations) =>
    set((state) => {
      const index = state.searches.findIndex(
        (p) => p.collectionId === collectionId,
      );

      if (index === -1) {
        state.searches.push({
          collectionId,
          searchTerm,
          matchedLocations,
        });

        return;
      }

      state.searches[index] = {
        collectionId,
        searchTerm,
        matchedLocations,
      };
    }),
  removeSearch: (collectionId) =>
    set((state) => {
      state.searches = state.searches.filter(
        (p) => p.collectionId !== collectionId,
      );
    }),
  hasSearch: (collectionId) => {
    return get().searches.some((p) => p.collectionId === collectionId);
  },
});
