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

export enum Tools {
  Legend = 'legend',
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
  layerId: string;
  color: string;
  visible: boolean;
};

export type SessionState = {
  legendEntries: LegendEntry[];
  setLegendEntries: (legendEntries: SessionState['legendEntries']) => void;
  downloadModalOpen: boolean;
  setDownloadModalOpen: (downloadModalOpen: SessionState['downloadModalOpen']) => void;
  tools: {
    [Tools.Legend]: boolean;
  };
  setOpenTools: (tool: Tools, open: boolean) => void;
  loadingInstances: Loading[];
  addLoadingInstance: (loadingInstance: Loading) => void;
  removeLoadingInstance: (id: string) => void;
  hasLoadingInstance: (text: string) => boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
};
