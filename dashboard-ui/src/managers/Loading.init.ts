/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import LoadingManager from '@/managers/Loading.manager';
import useSessionStore from '@/stores/session';
import { StoreApi } from 'zustand';
import { SessionState } from '@/stores/session/types';

const loadingManager = new LoadingManager(
    useSessionStore as unknown as StoreApi<SessionState>
);

export default loadingManager;
