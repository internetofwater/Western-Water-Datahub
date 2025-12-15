/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { v6 } from 'uuid';
import { StoreApi, UseBoundStore } from 'zustand';
import { SessionState, TLoading } from '@/stores/session/types';

class LoadingManager {
  private store: UseBoundStore<StoreApi<SessionState>>;

  constructor(store: UseBoundStore<StoreApi<SessionState>>) {
    this.store = store;
  }

  private createUUID(): TLoading['id'] {
    return v6();
  }

  add(message: TLoading['message'], type: TLoading['type']): TLoading['id'] {
    const loadingInstance: TLoading = {
      id: this.createUUID(),
      type,
      message,
    };

    this.store.getState().addLoadingInstance(loadingInstance);

    return loadingInstance.id;
  }

  remove(id: TLoading['id']): null {
    this.store.getState().removeLoadingInstance(id);

    return null;
  }

  has({ message, type }: { message?: TLoading['message']; type?: TLoading['type'] }): boolean {
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
