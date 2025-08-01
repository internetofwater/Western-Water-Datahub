/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BasemapId } from '@/components/Map/types';
import { LayerId } from '@/features/Map/consts';
import { create } from 'zustand';
import {
    BoundingGeographyLevel,
    Reservoir,
    ReservoirCollections,
    Tools,
} from '@/lib/types';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/lib/consts';

export interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    state: string;
    setState: (state: string) => void;
    reservoir: Reservoir | null;
    setReservoir: (reservoir: Reservoir | null) => void;
    boundingGeographyLevel: BoundingGeographyLevel;
    setBoundingGeographyLevel: (
        boundingGeographyLevel: BoundingGeographyLevel
    ) => void;
    reservoirCollections: ReservoirCollections | null;
    setReservoirCollections: (
        reservoirCollection: ReservoirCollections
    ) => void;
    basemap: BasemapId;
    setBasemap: (basemap: BasemapId) => void;
    chartUpdate: number;
    setChartUpdate: (chartUpdate: number) => void;
    toggleableLayers: {
        [LayerId.Snotel]: boolean;
        [LayerId.NOAARiverForecast]: boolean;
        [LayerId.USDroughtMonitor]: boolean;
        [LayerId.NOAAPrecipSixToTen]: boolean;
        [LayerId.NOAATempSixToTen]: boolean;
    };
    setToggleableLayers: (layer: LayerId, visible: boolean) => void;
    reservoirDate: string | null;
    setReservoirDate: (reservoirDate: string | null) => void;
    tools: {
        [Tools.BasemapSelector]: boolean;
        [Tools.Print]: boolean;
        [Tools.Controls]: boolean;
        [Tools.Legend]: boolean;
    };
    setOpenTools: (tool: Tools, open: boolean) => void;
    colorScheme: 'dark' | 'light';
    setColorScheme: (colorScheme: 'dark' | 'light') => void;
}

const useMainStore = create<MainState>()((set) => ({
    region: RegionDefault,
    setRegion: (region) => set({ region }),
    basin: BasinDefault,
    setBasin: (basin) => set({ basin }),
    state: StateDefault,
    setState: (state) => set({ state }),
    reservoir: ReservoirDefault,
    setReservoir: (reservoir) => set({ reservoir }),
    boundingGeographyLevel: BoundingGeographyLevel.Region,
    setBoundingGeographyLevel: (
        boundingGeographyLevel: BoundingGeographyLevel
    ) => set({ boundingGeographyLevel }),
    reservoirCollections: null,
    setReservoirCollections: (reservoirCollection) =>
        set({ reservoirCollections: reservoirCollection }),
    basemap: BasemapId.Standard,
    setBasemap: (basemap) => set({ basemap }),
    chartUpdate: 0,
    setChartUpdate: (chartUpdate) => set({ chartUpdate }),
    toggleableLayers: {
        [LayerId.Snotel]: false,
        [LayerId.NOAARiverForecast]: false,
        [LayerId.USDroughtMonitor]: true,
        [LayerId.NOAAPrecipSixToTen]: false,
        [LayerId.NOAATempSixToTen]: false,
    },
    setToggleableLayers: (layer, visible) =>
        set((state) => ({
            toggleableLayers: {
                ...state.toggleableLayers,
                [layer]: visible,
            },
        })),
    reservoirDate: null,
    setReservoirDate: (reservoirDate) => set({ reservoirDate }),
    tools: {
        [Tools.BasemapSelector]: false,
        [Tools.Print]: false,
        [Tools.Controls]: true,
        [Tools.Legend]: false,
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
