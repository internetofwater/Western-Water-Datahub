/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { ICollection } from "@/services/edr.service";
import { MainState, TPalette } from "@/stores/main/types";
import { PaletteDefinition } from "@/utils/colors/types";

export interface IPaletteSlice {
  palettes: TPalette[];
  setPalettes: (palettes: TPalette[]) => void;
  addPalette: (
    collectionId: ICollection["id"],
    palette: PaletteDefinition,
  ) => void;
  removePalette: (collectionId: ICollection["id"]) => void;
  hasPalette: (collectionId: ICollection["id"]) => boolean;
}

export const createPalettesSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  IPaletteSlice
> = (set, get) => ({
  palettes: [],

  setPalettes: (palettes) =>
    set((state) => {
      state.palettes = palettes;
    }),

  addPalette: (collectionId, palette) =>
    set((state) => {
      const index = state.palettes.findIndex(
        (p) => p.collectionId === collectionId,
      );

      if (index === -1) {
        state.palettes.push({
          collectionId,
          palette,
        });

        return;
      }

      state.palettes[index] = {
        collectionId,
        palette,
      };
    }),
  removePalette: (collectionId) =>
    set((state) => {
      state.palettes = state.palettes.filter(
        (p) => p.collectionId !== collectionId,
      );
    }),
  hasPalette: (collectionId) => {
    return get().palettes.some((p) => p.collectionId === collectionId);
  },
});
