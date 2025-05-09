/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BasemapId } from '@/components/Map/types';
import { ReservoirProperties } from '@/features/Map/types';
import { FeatureCollection, Point } from 'geojson';
import { create } from 'zustand';

export enum Tools {
    BasemapSelector = 'basemap-selector',
    Print = 'print',
}

export type ReservoirStorageData = Array<{ x: string; y: number }>;

export const ReservoirDefault = 0;

interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    system: string;
    setSystem: (system: string) => void;
    reservoir: number;
    setReservoir: (reservoir: number) => void;
    reservoirCollection: FeatureCollection<Point, ReservoirProperties> | null;
    setReservoirCollection: (
        reservoirCollection: FeatureCollection<Point, ReservoirProperties>
    ) => void;
    basemap: BasemapId;
    setBasemap: (basemap: BasemapId) => void;
    reservoirStorageData: Array<{ x: string; y: number }>;
    setReservoirStorageData: (basemap: Array<{ x: string; y: number }>) => void;
    chartUpdate: number;
    setChartUpdate: (chartUpdate: number) => void;
    tools: {
        [Tools.BasemapSelector]: boolean;
        [Tools.Print]: boolean;
    };
    setOpenTools: (tool: Tools, open: boolean) => void;
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
    reservoirCollection: null,
    setReservoirCollection: (reservoirCollection) =>
        set({ reservoirCollection }),
    basemap: BasemapId.Standard,
    setBasemap: (basemap) => set({ basemap }),
    reservoirStorageData: [],
    setReservoirStorageData: (reservoirStorageData) =>
        set({ reservoirStorageData }),
    chartUpdate: 0,
    setChartUpdate: (chartUpdate) => set({ chartUpdate }),
    tools: {
        [Tools.BasemapSelector]: false,
        [Tools.Print]: false,
    },
    setOpenTools: (tool, open) =>
        set((state) => ({
            tools: {
                ...state.tools,
                [tool]: open,
            },
        })),
}));

export default useMainStore;
