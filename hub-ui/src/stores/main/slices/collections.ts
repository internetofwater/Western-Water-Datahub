/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { Collection, MainState } from "@/stores/main/types";

interface CollectionSlice {
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  hasCollection: (collectionId: string) => boolean;
}

export const createCollectionSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
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
  hasCollection: (collectionId) =>
    get().collections.some((c) => c.id === collectionId),
});
