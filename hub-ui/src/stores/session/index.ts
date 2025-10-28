/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { HelpTab, SessionState, Tool } from '@/stores/session/types';
import { createLoadingSlice } from './slices/loading';
import { createNotificationsSlice } from './slices/notifications';

const useSessionStore = create<SessionState>()(
  immer((set, get, store) => ({
    legendEntries: [],
    setLegendEntries: (legendEntries) => set({ legendEntries }),
    openModal: null,
    setOpenModal: (openModal) => set({ openModal }),
    downloadModalOpen: false,
    setDownloadModalOpen: (downloadModalOpen) => set({ downloadModalOpen }),
    tools: {
      [Tool.Legend]: false,
    },
    setOpenTools: (tool, open) =>
      set((state) => ({
        tools: {
          ...state.tools,
          [tool]: open,
        },
      })),
    helpTab: HelpTab.About,
    setHelpTab: (helpTab) => set({ helpTab }),
    ...createLoadingSlice(set, get, store),
    ...createNotificationsSlice(set, get, store),
  }))
);

export default useSessionStore;
