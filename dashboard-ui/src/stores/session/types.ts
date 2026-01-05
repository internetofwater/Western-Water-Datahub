/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReservoirConfig } from '@/features/Map/types';
import { LoadingSlice } from '@/stores/session/slices/loading';
import { NotificationsSlice } from '@/stores/session/slices/notifications';
import { Feature, Point } from 'geojson';

export enum NotificationType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
}

export enum LoadingType {
    Reservoirs = 'reservoirs',
    Snotel = 'snotel',
    NOAA = 'noaa',
    Chart = 'chart',
}

export enum Overlay {
    Basemap = 'basemap',
    Screenshot = 'screenshot',
    Detail = 'detail',
    Help = 'help',
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
    collectionId: string;
    color: string;
    visible: boolean;
};

export type Highlight = {
    config: ReservoirConfig;
    feature: Feature<Point>;
};

export enum HelpTab {
    About = 'about',
    FAQ = 'FAQ',
    Glossary = 'glossary',
    Contact = 'contact',
}

export type SessionState = {
    legendEntries: LegendEntry[];
    setLegendEntries: (legendEntries: SessionState['legendEntries']) => void;
    overlay: Overlay | null;
    setOverlay: (overlay: SessionState['overlay']) => void;
    downloadModalOpen: boolean;
    setDownloadModalOpen: (
        downloadModalOpen: SessionState['downloadModalOpen']
    ) => void;
    highlight: Highlight | null;
    setHighlight: (highlight: SessionState['highlight']) => void;
    helpTab: HelpTab;
    setHelpTab: (helpTab: SessionState['helpTab']) => void;
} & NotificationsSlice &
    LoadingSlice;
