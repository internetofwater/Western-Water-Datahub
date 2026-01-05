/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import NotificationManager from '@/managers/Notification.manager';
import useSessionStore from '@/stores/session';
import { SessionState } from '@/stores/session/types';
import { StoreApi } from 'zustand';

const notificationManager = new NotificationManager(
    useSessionStore as unknown as StoreApi<SessionState>
);

export default notificationManager;
