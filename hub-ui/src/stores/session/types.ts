/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from "react";
import { TLocation } from "@/stores/main/types";
import { LoadingSlice } from "./slices/loading";
import { NotificationsSlice } from "./slices/notifications";
import { WarningsSlice } from "./slices/warning";

export enum NotificationType {
  Success = "success",
  Error = "error",
  Info = "info",
}

/**
 * Defines the types of loading instances
 *
 * Values:
 * - Collections: Critical path of the application, should block locations requests
 * - Geography: When requesting new filter boundaries, should block locations requests
 * - Data: When requesting items like non-required select options or chart data, should not block locations requests
 *
 * @enum
 */
export enum LoadingType {
  Locations = "locations",
  Collections = "collections",
  Geography = "geography",
  Data = "data",
}

export enum Tool {
  Legend = "legend",
}

export enum Modal {
  Download = "download",
  Help = "help",
}

export enum HelpTab {
  About = "about",
  FAQ = "FAQ",
  Glossary = "glossary",
}

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  visible: boolean;
};

export type Loading = {
  id: string;
  type: LoadingType;
  message: string;
};

export type LegendEntry = {
  collectionId: string;
  color: string;
  visible: boolean;
};

export type Warning = {
  id: string;
  content: ReactNode;
};

export type SessionState = {
  legendEntries: LegendEntry[];
  setLegendEntries: (legendEntries: SessionState["legendEntries"]) => void;
  openModal: Modal | null;
  setOpenModal: (openModal: SessionState["openModal"]) => void;
  tools: {
    [Tool.Legend]: boolean;
  };
  setOpenTools: (tool: Tool, open: boolean) => void;
  linkLocation: TLocation | null;
  setLinkLocation: (linkLocation: SessionState["linkLocation"]) => void;
  helpTab: HelpTab;
  setHelpTab: (helpTab: SessionState["helpTab"]) => void;
} & LoadingSlice &
  NotificationsSlice &
  WarningsSlice;
