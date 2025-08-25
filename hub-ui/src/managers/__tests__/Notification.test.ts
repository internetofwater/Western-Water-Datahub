/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom';

import { vi } from 'vitest';
import { StoreApi, UseBoundStore } from 'zustand';
import useSessionStore from '@/stores/session';
import { NotificationType, SessionState } from '@/stores/session/types';
import NotificationManager from '../Notification.manager';

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;
  let store: UseBoundStore<StoreApi<SessionState>>;

  beforeEach(() => {
    store = useSessionStore;

    notificationManager = new NotificationManager(store);
  });

  afterEach(() => {
    const notifications = store.getState().notifications;
    notifications.forEach((notification) => notificationManager.hide(notification.id));
  });

  test('should show a notification and add it to the store', () => {
    const id = notificationManager.show('Test message', NotificationType.Info, 1000);

    const notifications = store.getState().notifications;
    expect(notifications.length).toBe(1);
    const notification = notifications.find((notification) => notification.id === id);
    expect(notification).toBeDefined();
    expect(notification?.message).toBe('Test message');
  });

  test('should hide a notification and remove it from the store', () => {
    const id = notificationManager.show('Hide me', NotificationType.Info, 1000);

    notificationManager.hide(id);

    const notifications = store.getState().notifications;
    expect(notifications.length).toBe(0);
  });

  test('should pause and resume a notification timer', () => {
    vi.useFakeTimers();

    const id = notificationManager.show('Pause me', NotificationType.Info, 3000);
    vi.advanceTimersByTime(1000);

    notificationManager.pause(id);
    const pausedTimer = (notificationManager as any).get(id);
    expect(pausedTimer.remaining).toBe(2000);

    notificationManager.resume(id);
    const resumedTimer = (notificationManager as any).get(id);
    expect(resumedTimer.timeoutId).toBeDefined();

    vi.advanceTimersByTime(2000);

    const notifications = store.getState().notifications;
    expect(notifications.length).toBe(0);

    vi.useRealTimers();
  });

  test('should auto-remove notification after duration', () => {
    vi.useFakeTimers();

    notificationManager.show('Auto remove', NotificationType.Info, 1000);

    vi.advanceTimersByTime(1000);

    const notifications = store.getState().notifications;
    expect(notifications.length).toBe(0);

    vi.useRealTimers();
  });
});
