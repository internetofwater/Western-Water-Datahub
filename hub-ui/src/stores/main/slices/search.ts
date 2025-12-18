/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { ICollection } from "@/services/edr.service";
import { MainState, TSearch } from "@/stores/main/types";

export interface ISearchSlice {
  searchTerms: TSearch[];
  setSearchTerms: (searchTerms: TSearch[]) => void;
  addSearchTerm: (
    collectionId: ICollection["id"],
    searchTerm: string,
    matchedLocations: string[],
  ) => void;
  removeSearchTerm: (collectionId: ICollection["id"]) => void;
  hasSearchTerm: (collectionId: ICollection["id"]) => boolean;
}

export const createSearchSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  ISearchSlice
> = (set, get) => ({
  searchTerms: [],
  setSearchTerms: (searchTerms) =>
    set((state) => {
      state.searchTerms = searchTerms;
    }),
  addSearchTerm: (collectionId, searchTerm, matchedLocations) =>
    set((state) => {
      const index = state.searchTerms.findIndex(
        (p) => p.collectionId === collectionId,
      );

      if (index === -1) {
        state.searchTerms.push({
          collectionId,
          searchTerm,
          matchedLocations,
        });

        return;
      }

      state.searchTerms[index] = {
        collectionId,
        searchTerm,
        matchedLocations,
      };
    }),
  removeSearchTerm: (collectionId) =>
    set((state) => {
      state.searchTerms = state.searchTerms.filter(
        (p) => p.collectionId !== collectionId,
      );
    }),
  hasSearchTerm: (collectionId) => {
    return get().searchTerms.some((p) => p.collectionId === collectionId);
  },
});
