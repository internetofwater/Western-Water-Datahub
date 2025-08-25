/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import NotificationManager from '@/managers/Notification.manager';
import useSessionStore from '@/stores/session';

const notificationManager = new NotificationManager(useSessionStore);

export default notificationManager;
