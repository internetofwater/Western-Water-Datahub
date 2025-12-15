/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { TLocation } from '@/stores/main/types';
import { LoadingSlice } from './slices/loading';
import { NotificationsSlice } from './slices/notifications';
import { WarningsSlice } from './slices/warning';

export enum ENotificationType {
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
export enum ELoadingType {
  Locations = 'locations',
  Collections = 'collections',
  Geography = 'geography',
  Data = 'data',
}

export enum ETool {
  Legend = 'legend',
}

export enum EModal {
  Download = 'download',
  Help = 'help',
}

export enum EHelpTab {
  About = 'about',
  FAQ = 'FAQ',
  Glossary = 'glossary',
}

export type TNotification = {
  id: string;
  message: string;
  type: ENotificationType;
  visible: boolean;
};

export type TLoading = {
  id: string;
  type: ELoadingType;
  message: string;
};

export enum EOverlay {
  Legend = 'legend',
  Info = 'info',
  Warning = 'warning',
  Download = 'download',
  Date = 'date',
}

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
  setLegendEntries: (legendEntries: SessionState['legendEntries']) => void;
  openModal: EModal | null;
  setOpenModal: (openModal: SessionState['openModal']) => void;
  overlay: EOverlay | null;
  setOverlay: (overlay: SessionState['overlay']) => void;
  tools: {
    [ETool.Legend]: boolean;
  };
  setOpenTools: (tool: ETool, open: boolean) => void;
  linkLocation: TLocation | null;
  setLinkLocation: (linkLocation: SessionState['linkLocation']) => void;
  helpTab: EHelpTab;
  setHelpTab: (helpTab: SessionState['helpTab']) => void;
} & LoadingSlice &
  NotificationsSlice &
  WarningsSlice;
