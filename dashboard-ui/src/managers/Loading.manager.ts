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

  add(message: Loading['message'], type: Loading['type']): Loading['id'] {
    const loadingInstance: Loading = {
      id: this.createUUID(),
      type,
      message,
    };

    this.store.getState().addLoadingInstance(loadingInstance);

    return loadingInstance.id;
  }

  remove(id: Loading['id']): null {
    this.store.getState().removeLoadingInstance(id);

    return null;
  }

  has({ message, type }: { message?: Loading['message']; type?: Loading['type'] }): boolean {
    const loadingInstances = this.store.getState().loadingInstances;

    if (message) {
      return loadingInstances.some((instance) => instance.message.includes(message));
    }

    if (type) {
      return loadingInstances.some((instance) => instance.type === type);
    }

    return false;
  }
}

export default LoadingManager;
