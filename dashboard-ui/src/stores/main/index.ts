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
    // Selected Region filter
    region: string;
    setRegion: (region: MainState['region']) => void;
    // Selected Basin
    basin: string;
    setBasin: (basin: MainState['basin']) => void;
    // Selected State
    state: string;
    setState: (state: MainState['state']) => void;
    // Reservoir selected from table or map
    reservoir: Reservoir | null;
    setReservoir: (reservoir: MainState['reservoir']) => void;
    // What level of geography is selected (Region,Basin,State,None)
    boundingGeographyLevel: BoundingGeographyLevel;
    setBoundingGeographyLevel: (
        boundingGeographyLevel: MainState['boundingGeographyLevel']
    ) => void;
    // Show all labels for bounding geography layer
    showAllLabels: boolean;
    setShowAllLabels: (showAllLabels: MainState['showAllLabels']) => void;
    // All feature collections for all reservoir sources
    // Used to show content like popups, table, or details modal
    // Set in useReservoirData hook
    reservoirCollections: ReservoirCollections | null;
    setReservoirCollections: (
        reservoirCollection: MainState['reservoirCollections']
    ) => void;
    // Current basemap chosen through selector
    basemap: BasemapId;
    setBasemap: (basemap: MainState['basemap']) => void;
    // Flag used to determine when safe to copy chart for report (deprecated)
    chartUpdate: number;
    setChartUpdate: (chartUpdate: MainState['chartUpdate']) => void;
    // Reference data layers that can be toggled on/off
    toggleableLayers: {
        [LayerId.Snotel]: boolean;
        [LayerId.NOAARiverForecast]: boolean;
        [LayerId.USDroughtMonitor]: boolean;
        [LayerId.NOAAPrecipSixToTen]: boolean;
        [LayerId.NOAATempSixToTen]: boolean;
    };
    setToggleableLayers: (layer: string, visible: boolean) => void;
    // Selected date for reservoir data
    reservoirDate: string | null;
    setReservoirDate: (reservoirDate: MainState['reservoirDate']) => void;
    // Used to track which tools are opened by mapbox buttons (deprecated)
    tools: {
        [Tools.BasemapSelector]: boolean;
        [Tools.Print]: boolean;
    };
    setOpenTools: (tool: Tools, open: boolean) => void;
    // Current selected color scheme, is set to client OS preference on 1st page load
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
    showAllLabels: false,
    setShowAllLabels: (showAllLabels) => set({ showAllLabels }),
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
