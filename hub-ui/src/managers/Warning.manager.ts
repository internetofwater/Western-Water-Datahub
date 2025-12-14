/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoreApi, UseBoundStore } from 'zustand';
import { SessionState, Warning } from '@/stores/session/types';

export const WARNING_PREFIX = 'warning';

class WarningManager {
  private store: UseBoundStore<StoreApi<SessionState>>;

  constructor(store: UseBoundStore<StoreApi<SessionState>>) {
    this.store = store;
  }

  add(id: Warning['id'], content: Warning['content']): Warning['id'] {
    const loadingInstance: Warning = {
      id,
      content,
    };

    this.store.getState().addWarning(loadingInstance);

    return loadingInstance.id;
  }

  remove(id: Warning['id']): null {
    this.store.getState().removeWarning(id);

    return null;
  }
}

export default WarningManager;
