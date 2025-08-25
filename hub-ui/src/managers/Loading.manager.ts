/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { v6 } from 'uuid';
import { StoreApi, UseBoundStore } from 'zustand';
import { Loading, SessionState } from '@/stores/session/types';

class LoadingManager {
  private store: UseBoundStore<StoreApi<SessionState>>;

  constructor(store: UseBoundStore<StoreApi<SessionState>>) {
    this.store = store;
  }

  private createUUID(): Loading['id'] {
    return v6();
  }

  add(message: Loading['message']): Loading['id'] {
    const loadingInstance: Loading = {
      id: this.createUUID(),
      message,
    };

    this.store.getState().addLoadingInstance(loadingInstance);

    return loadingInstance.id;
  }

  remove(id: Loading['id']) {
    this.store.getState().removeLoadingInstance(id);
  }
}

export default LoadingManager;
