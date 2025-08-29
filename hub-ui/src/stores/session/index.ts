/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SessionState } from '@/stores/session/types';

const useSessionStore = create<SessionState>((set, get) => ({
  downloadModalOpen: false,
  setDownloadModalOpen: (downloadModalOpen) => set({ downloadModalOpen }),
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
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
}));

export default useSessionStore;
