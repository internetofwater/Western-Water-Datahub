/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
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
  Locations = 'locations',
  Collections = 'collections',
  Geography = 'geography',
  Data = 'data',
}

export enum Tool {
  Legend = 'legend',
}

export enum Modal {
  Download = 'download',
  Help = 'help',
}

export enum HelpTab {
  About = 'about',
  FAQ = 'FAQ',
  Glossary = 'glossary',
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

export type SessionState = {
  legendEntries: LegendEntry[];
  setLegendEntries: (legendEntries: SessionState['legendEntries']) => void;
  openModal: Modal | null;
  setOpenModal: (openModal: SessionState['openModal']) => void;
  tools: {
    [Tool.Legend]: boolean;
  };
  setOpenTools: (tool: Tool, open: boolean) => void;
  helpTab: HelpTab;
  setHelpTab: (helpTab: SessionState['helpTab']) => void;
  loadingInstances: Loading[];
  addLoadingInstance: (loadingInstance: Loading) => void;
  removeLoadingInstance: (id: Loading['id']) => void;
  hasLoadingInstance: (text: string) => boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
};
