/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { v6 } from 'uuid';
import { StoreApi, UseBoundStore } from 'zustand';
import { Notification, NotificationType, SessionState } from '@/stores/session/types';

type Timer = {
  timeoutId: ReturnType<typeof setTimeout>;
  startTime: number;
  remaining: number;
};

class NotificationManager {
  private timers: Map<string, Timer>;
  private store: UseBoundStore<StoreApi<SessionState>>;

  constructor(store: UseBoundStore<StoreApi<SessionState>>) {
    this.store = store;
    this.timers = new Map<string, Timer>();
  }

  private createUUID(): Notification['id'] {
    return v6();
  }

  private get(id: Notification['id']): Timer | undefined {
    return this.timers.get(id);
  }

  private add(id: Notification['id'], timer: Timer) {
    this.timers.set(id, timer);
  }

  private remove(id: Notification['id']) {
    this.timers.delete(id);
  }

  private startTimer(id: Notification['id'], duration: number): ReturnType<typeof setTimeout> {
    return setTimeout(() => {
      this.store.getState().removeNotification(id);
      this.remove(id);
    }, duration);
  }

  show(
    message: string,
    type: NotificationType = NotificationType.Info,
    duration: number = 3000
  ): Notification['id'] {
    const id = this.createUUID();

    this.store.getState().addNotification({
      id,
      message,
      type,
      visible: true,
    });

    const startTime = Date.now();
    const timeoutId = this.startTimer(id, duration);

    this.add(id, {
      timeoutId,
      startTime,
      remaining: duration,
    });

    return id;
  }

  pause(id: string) {
    const timer = this.get(id);

    if (!timer) {
      throw new Error(`Error: no timer instance found for id: ${id}`);
    }

    if (timer) {
      clearTimeout(timer.timeoutId);
      timer.remaining -= Date.now() - timer.startTime;
    }
  }

  resume(id: string) {
    const timer = this.get(id);

    if (!timer) {
      throw new Error(`Error: no timer instance found for id: ${id}`);
    }

    if (timer.remaining > 0) {
      timer.startTime = Date.now();
      timer.timeoutId = this.startTimer(id, timer.remaining);
    }
  }

  hide(id: string) {
    const timer = this.get(id);

    if (!timer) {
      throw new Error(`Error: no timer instance found for id: ${id}`);
    }

    if (timer) {
      clearTimeout(timer.timeoutId);
      this.remove(id);
    }
    this.store.getState().removeNotification(id);
  }
}

export default NotificationManager;
