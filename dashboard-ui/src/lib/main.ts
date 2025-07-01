/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BasemapId } from '@/components/Map/types';
import { SourceId } from '@/features/Map/consts';
import { FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import { create } from 'zustand';

export enum Tools {
    BasemapSelector = 'basemap-selector',
    Print = 'print',
    Controls = 'controls',
}

export type ReservoirStorageData = Array<{ x: string; y: number }>;

export const ReservoirDefault = null;

export type ReservoirCollections = {
    [key in SourceId]?: FeatureCollection<Point, GeoJsonProperties>;
};

export type Reservoir = {
    identifier: string | number;
    source: string;
};

export interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    system: string;
    setSystem: (system: string) => void;
    reservoir: Reservoir | null;
    setReservoir: (reservoir: Reservoir | null) => void;
    reservoirCollections: ReservoirCollections | null;
    setReservoirCollections: (
        reservoirCollection: ReservoirCollections
    ) => void;
    basemap: BasemapId;
    setBasemap: (basemap: BasemapId) => void;
    chartUpdate: number;
    setChartUpdate: (chartUpdate: number) => void;
    tools: {
        [Tools.BasemapSelector]: boolean;
        [Tools.Print]: boolean;
        [Tools.Controls]: boolean;
    };
    setOpenTools: (tool: Tools, open: boolean) => void;
    colorScheme: 'dark' | 'light';
    setColorScheme: (colorScheme: 'dark' | 'light') => void;
}

const useMainStore = create<MainState>()((set) => ({
    region: 'all',
    setRegion: (region) => set({ region }),
    basin: 'all',
    setBasin: (basin) => set({ basin }),
    system: 'all',
    setSystem: (system) => set({ system }),
    reservoir: ReservoirDefault,
    setReservoir: (reservoir) => set({ reservoir }),
    reservoirCollections: null,
    setReservoirCollections: (reservoirCollection) =>
        set({ reservoirCollections: reservoirCollection }),
    basemap: BasemapId.Standard,
    setBasemap: (basemap) => set({ basemap }),
    chartUpdate: 0,
    setChartUpdate: (chartUpdate) => set({ chartUpdate }),
    tools: {
        [Tools.BasemapSelector]: false,
        [Tools.Print]: false,
        [Tools.Controls]: true,
    },
    setOpenTools: (tool, open) =>
        set((state) => ({
            tools: {
                ...state.tools,
                [tool]: open,
            },
        })),
    colorScheme: 'dark',
    setColorScheme: (colorScheme: 'dark' | 'light') => set({ colorScheme }),
}));

export default useMainStore;
