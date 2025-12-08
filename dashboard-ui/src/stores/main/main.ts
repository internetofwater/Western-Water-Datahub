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
} from '@/stores/main/types';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/stores/main/consts';

export interface MainState {
    region: string;
    setRegion: (region: MainState['region']) => void;
    basin: string;
    setBasin: (basin: MainState['basin']) => void;
    state: string;
    setState: (state: MainState['state']) => void;
    reservoir: Reservoir | null;
    setReservoir: (reservoir: MainState['reservoir']) => void;
    boundingGeographyLevel: BoundingGeographyLevel;
    setBoundingGeographyLevel: (
        boundingGeographyLevel: MainState['boundingGeographyLevel']
    ) => void;
    reservoirCollections: ReservoirCollections | null;
    setReservoirCollections: (
        reservoirCollection: MainState['reservoirCollections']
    ) => void;
    basemap: BasemapId;
    setBasemap: (basemap: MainState['basemap']) => void;
    chartUpdate: number;
    setChartUpdate: (chartUpdate: MainState['chartUpdate']) => void;
    toggleableLayers: {
        [LayerId.Snotel]: boolean;
        [LayerId.NOAARiverForecast]: boolean;
        [LayerId.USDroughtMonitor]: boolean;
        [LayerId.NOAAPrecipSixToTen]: boolean;
        [LayerId.NOAATempSixToTen]: boolean;
    };
    setToggleableLayers: (layer: string, visible: boolean) => void;
    reservoirDate: string | null;
    setReservoirDate: (reservoirDate: MainState['reservoirDate']) => void;
    tools: {
        [Tools.BasemapSelector]: boolean;
        [Tools.Print]: boolean;
    };
    setOpenTools: (tool: Tools, open: boolean) => void;
    colorScheme: 'dark' | 'light';
    setColorScheme: (colorScheme: MainState['colorScheme']) => void;
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
    setBoundingGeographyLevel: (boundingGeographyLevel) =>
        set({ boundingGeographyLevel }),
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
    },
    setOpenTools: (tool, open) =>
        set((state) => ({
            tools: {
                ...state.tools,
                [tool]: open,
            },
        })),
    colorScheme: 'dark',
    setColorScheme: (colorScheme) => set({ colorScheme }),
}));

export default useMainStore;
