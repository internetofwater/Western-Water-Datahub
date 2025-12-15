/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from 'zustand';
import { SessionState, TLoading } from '@/stores/session/types';

export interface LoadingSlice {
  loadingInstances: TLoading[];
  addLoadingInstance: (loadingInstance: TLoading) => void;
  removeLoadingInstance: (id: string) => void;
  hasLoadingInstance: (text: string) => boolean;
}

export const createLoadingSlice: StateCreator<
  SessionState,
  [['zustand/immer', never]],
  [],
  LoadingSlice
> = (set, get) => ({
  loadingInstances: [],
  addLoadingInstance: (loadingInstance) =>
    set((state) => ({
      loadingInstances: [...state.loadingInstances, loadingInstance],
    })),
  removeLoadingInstance: (id) =>
    set((state) => ({
      loadingInstances: state.loadingInstances.filter(
        (loadingInstance) => loadingInstance.id !== id
      ),
    })),
  hasLoadingInstance: (text) =>
    get().loadingInstances.some((instance) => instance.message.includes(text)),
});
