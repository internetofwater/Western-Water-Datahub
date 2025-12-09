/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createLoadingSlice } from "@/stores/session/slices/loading";
import { createNotificationsSlice } from "@/stores/session/slices/notifications";
import { HelpTab, SessionState, Tool } from "@/stores/session/types";

const useSessionStore = create<SessionState>()(
  immer((set, get, store) => ({
    legendEntries: [],
    setLegendEntries: (legendEntries) => set({ legendEntries }),
    openModal: null,
    setOpenModal: (openModal) => set({ openModal }),
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
  })),
);

export default useSessionStore;
