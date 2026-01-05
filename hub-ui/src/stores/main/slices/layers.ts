/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { MainState, TLayer } from "@/stores/main/types";

export interface ILayerSlice {
  layers: TLayer[];
  setLayers: (layers: TLayer[]) => void;
  addLayer: (layer: TLayer) => void;
  removeLayer: (layerId: TLayer["id"]) => void;
  updateLayer: (layer: TLayer) => void;
  hasLayer: (options: {
    layerId?: TLayer["id"];
    collectionId?: TLayer["collectionId"];
  }) => boolean;
  updateLayerPosition: (id: TLayer["id"], newPosition: number) => void;

  setLayerParameters: (
    target: { layerId?: TLayer["id"]; collectionId?: TLayer["collectionId"] },
    parameters: string[],
  ) => void;

  addLayerParameter: (
    target: { layerId?: TLayer["id"]; collectionId?: TLayer["collectionId"] },
    parameter: string,
  ) => void;

  removeLayerParameter: (
    target: { layerId?: TLayer["id"]; collectionId?: TLayer["collectionId"] },
    parameter: string,
  ) => void;

  hasLayerParameter: (
    target: { layerId?: TLayer["id"]; collectionId?: TLayer["collectionId"] },
    parameter: string,
  ) => boolean;
}

export const createLayerSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  ILayerSlice
> = (set, get) => ({
  layers: [],
  setLayers: (layers) => set({ layers }),
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),
  removeLayer: (layerId) =>
    set((state) => ({
      layers: state.layers
        .filter((layer) => layer.id !== layerId)
        .map((layer, index) => ({ ...layer, position: index + 1 })),
    })),
  updateLayer: (updatedLayer) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === updatedLayer.id ? updatedLayer : layer,
      ),
    })),
  hasLayer: ({ layerId, collectionId }) => {
    if (layerId) {
      return get().layers.some((c) => c.id === layerId);
    }
    if (collectionId) {
      return get().layers.some((c) => c.collectionId === collectionId);
    }
    return false;
  },
  updateLayerPosition: (id, newPosition) => {
    set((state) => {
      const layers = [...state.layers];
      const currentIndex = layers.findIndex((l) => l.id === id);
      if (currentIndex === -1) {
        return;
      }

      const oldPosition = layers[currentIndex].position;

      layers[currentIndex].position = newPosition;

      // Shift other layers to avoid duplicate positions
      layers.forEach((l) => {
        if (l.id !== id) {
          if (
            oldPosition < newPosition &&
            l.position > oldPosition &&
            l.position <= newPosition
          ) {
            l.position -= 1;
          } else if (
            oldPosition > newPosition &&
            l.position < oldPosition &&
            l.position >= newPosition
          ) {
            l.position += 1;
          }
        }
      });

      state.layers = layers.sort((a, b) => a.position - b.position);
    });
  },

  setLayerParameters: (target, parameters) =>
    set((state) => {
      const indices = findLayer(state.layers, target);
      if (indices.length === 0) {
        return;
      }
      indices.forEach((idx) => {
        state.layers[idx].parameters = [...new Set(parameters)];
      });
    }),

  addLayerParameter: (target, parameter) =>
    set((state) => {
      const indices = findLayer(state.layers, target);
      if (indices.length === 0) {
        return;
      }
      indices.forEach((idx) => {
        const arr = state.layers[idx].parameters ?? [];
        if (!arr.includes(parameter)) {
          arr.push(parameter);
        }
        state.layers[idx].parameters = arr;
      });
    }),
  removeLayerParameter: (target, parameter) =>
    set((state) => {
      const indices = findLayer(state.layers, target);
      if (indices.length === 0) {
        return;
      }
      indices.forEach((idx) => {
        const arr = state.layers[idx].parameters ?? [];
        state.layers[idx].parameters = arr.filter((p) => p !== parameter);
      });
    }),

  hasLayerParameter: (target, parameter) => {
    const { layers } = get();
    const indices = findLayer(layers, target);
    if (indices.length === 0) {
      return false;
    }
    return indices.some((idx) => layers[idx].parameters?.includes(parameter));
  },
});

const findLayer = (
  layers: TLayer[],
  target: { layerId?: TLayer["id"]; collectionId?: TLayer["collectionId"] },
): number[] => {
  if (target.layerId) {
    const idx = layers.findIndex((l) => l.collectionId === target.layerId);
    return idx === -1 ? [] : [idx];
  }
  if (target.collectionId) {
    const indices: number[] = [];
    layers.forEach((l, i) => {
      if (l.collectionId === target.collectionId) {
        indices.push(i);
      }
    });
    return indices;
  }
  return [];
};
