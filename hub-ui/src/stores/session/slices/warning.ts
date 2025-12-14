/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from 'zustand';
import { SessionState, Warning } from '@/stores/session/types';

export interface WarningsSlice {
  warnings: Warning[];
  addWarning: (warning: Warning) => void;
  removeWarning: (id: string) => void;
}

export const createWarningsSlice: StateCreator<
  SessionState,
  [['zustand/immer', never]],
  [],
  WarningsSlice
> = (set, _get) => ({
  warnings: [],
  addWarning: (warning) =>
    set((state) => ({
      warnings: [...state.warnings, warning],
    })),
  removeWarning: (id) =>
    set((state) => ({
      warnings: state.warnings.filter((warning) => warning.id !== id),
    })),
});
