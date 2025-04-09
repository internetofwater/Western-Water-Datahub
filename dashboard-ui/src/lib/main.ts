import { BasemapId } from '@/components/Map/types';
import { create } from 'zustand';

export enum Tools {
    BasemapSelector = 'basemap-selector',
    Print = 'print',
}

interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    system: string;
    setSystem: (system: string) => void;
    reservoir: string;
    setReservoir: (reservoir: string) => void;
    basemap: BasemapId;
    setBasemap: (basemap: BasemapId) => void;
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
    reservoir: 'all',
    setReservoir: (reservoir) => set({ reservoir }),
    basemap: BasemapId.Standard,
    setBasemap: (basemap) => set({ basemap }),
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
