/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { StateCreator } from 'zustand';
import { SessionState, TNotification } from '@/stores/session/types';

export interface NotificationsSlice {
  notifications: TNotification[];
  addNotification: (notification: TNotification) => void;
  removeNotification: (id: string) => void;
}

export const createNotificationsSlice: StateCreator<
  SessionState,
  [['zustand/immer', never]],
  [],
  NotificationsSlice
> = (set, _get) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
});
