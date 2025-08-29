/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NotificationType {
  Success = "success",
  Error = "error",
  Info = "info",
}

export enum Tools {
  Legend = "legend",
}

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  visible: boolean;
};

export type Loading = {
  id: string;
  message: string;
};

export type LegendEntry = {
  layerId: string;
  color: string;
  visible: boolean;
};

export type SessionState = {
  legendEntries: LegendEntry[];
  setLegendEntries: (legendEntries: SessionState["legendEntries"]) => void;
  downloadModalOpen: boolean;
  setDownloadModalOpen: (
    downloadModalOpen: SessionState["downloadModalOpen"],
  ) => void;
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
