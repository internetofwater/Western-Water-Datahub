/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore } from 'zustand';
import useSessionStore from '@/stores/session';
import { LoadingType, SessionState } from '@/stores/session/types';
import LoadingManager from '../Loading.manager';

describe('LoadingManager', () => {
  let loadingManager: LoadingManager;
  let store: UseBoundStore<StoreApi<SessionState>>;

  beforeEach(() => {
    store = useSessionStore;
    loadingManager = new LoadingManager(store);
  });

  afterEach(() => {
    const loadingInstances = store.getState().loadingInstances;
    loadingInstances.forEach((loading) => loadingManager.remove(loading.id));
  });

  test('should add a loading instance to the store', () => {
    const id = loadingManager.add('Loading data...', LoadingType.Data);
    const loadingInstances = store.getState().loadingInstances;

    expect(loadingInstances.length).toBe(1);
    const loading = loadingInstances.find((l) => l.id === id);
    expect(loading).toBeDefined();
    expect(loading?.message).toBe('Loading data...');
  });

  test('should remove a loading instance from the store', () => {
    const id = loadingManager.add('Removing...', LoadingType.Data);
    loadingManager.remove(id);

    const loadingInstances = store.getState().loadingInstances;
    expect(loadingInstances.length).toBe(0);
  });
});
