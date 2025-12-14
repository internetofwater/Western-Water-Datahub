/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from "zustand";
import { ICollection } from "@/services/edr.service";
import { MainState, TParameter } from "@/stores/main/types";

export interface IParameterSlice {
  parameters: TParameter[];
  setParameters: (parameters: TParameter[]) => void;
  addParameter: (collectionId: ICollection["id"], parameter: string) => void;
  removeParameter: (collectionId: ICollection["id"], parameter: string) => void;
  hasParameter: (collectionId: ICollection["id"], parameter: string) => boolean;
  hasCollection: (collectionId: string) => boolean;
}

export const createParametersSlice: StateCreator<
  MainState,
  [["zustand/immer", never]],
  [],
  IParameterSlice
> = (set, get) => ({
  parameters: [],

  setParameters: (parameters) =>
    set((state) => {
      state.parameters = parameters;
    }),

  addParameter: (collectionId, parameter) =>
    set((state) => {
      const entry = state.parameters.find(
        (p) => p.collectionId === collectionId,
      );

      if (!entry) {
        state.parameters.push({
          collectionId,
          parameters: [parameter],
        });
        return;
      }

      if (!entry.parameters.includes(parameter)) {
        entry.parameters.push(parameter);
      }
    }),
  removeParameter: (collectionId, parameter) =>
    set((state) => {
      const entry = state.parameters.find(
        (p) => p.collectionId === collectionId,
      );
      if (!entry) {
        return;
      }

      entry.parameters = entry.parameters.filter((p) => p !== parameter);

      if (entry.parameters.length === 0) {
        state.parameters = state.parameters.filter(
          (p) => p.collectionId !== collectionId,
        );
      }
    }),
  hasParameter: (collectionId, parameter) => {
    const entry = get().parameters.find((p) => p.collectionId === collectionId);
    return Boolean(entry && entry.parameters.includes(parameter));
  },
  hasCollection: (collectionId) => {
    return get().parameters.some((p) => p.collectionId === collectionId);
  },
});
