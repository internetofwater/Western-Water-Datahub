/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createLoadingSlice } from '@/stores/session/slices/loading';
import { createNotificationsSlice } from '@/stores/session/slices/notifications';
import { EHelpTab, ETool, SessionState } from '@/stores/session/types';
import { createWarningsSlice } from './slices/warning';

const useSessionStore = create<SessionState>()(
  immer((set, get, store) => ({
    legendEntries: [],
    setLegendEntries: (legendEntries) => set({ legendEntries }),
    openModal: null,
    setOpenModal: (openModal) => set({ openModal }),
    overlay: null,
    setOverlay: (overlay) => set({ overlay }),
    tools: {
      [ETool.Legend]: false,
    },
    setOpenTools: (tool, open) =>
      set((state) => ({
        tools: {
          ...state.tools,
          [tool]: open,
        },
      })),
    linkLocation: null,
    setLinkLocation: (linkLocation) => set({ linkLocation }),
    helpTab: EHelpTab.About,
    setHelpTab: (helpTab) => set({ helpTab }),
    ...createLoadingSlice(set, get, store),
    ...createNotificationsSlice(set, get, store),
    ...createWarningsSlice(set, get, store),
  }))
);

export default useSessionStore;
