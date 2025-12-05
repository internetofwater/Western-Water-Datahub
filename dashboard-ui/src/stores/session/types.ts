/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoadingSlice } from '@/stores/session/slices/loading';
import { NotificationsSlice } from '@/stores/session/slices/notifications';
import { GeoJSONFeature } from 'mapbox-gl';

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

export enum Tool {
    Legend = 'legend',
}

export enum Overlay {
    Share = 'share',
    Draw = 'draw',
    Basemap = 'basemap',
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
    collectionId: string;
    color: string;
    visible: boolean;
};

export type SessionState = {
    legendEntries: LegendEntry[];
    setLegendEntries: (legendEntries: SessionState['legendEntries']) => void;
    overlay: Overlay | null;
    setOverlay: (overlay: SessionState['overlay']) => void;
    downloadModalOpen: boolean;
    setDownloadModalOpen: (
        downloadModalOpen: SessionState['downloadModalOpen']
    ) => void;
    hoverFeature: GeoJSONFeature | null;
    setHoverFeature: (hoverFeature: SessionState['hoverFeature']) => void;
    tools: {
        [Tool.Legend]: boolean;
    };
    setOpenTools: (tool: Tool, open: boolean) => void;
} & NotificationsSlice &
    LoadingSlice;
