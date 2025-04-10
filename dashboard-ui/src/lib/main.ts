import { create } from 'zustand';

interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    system: string;
    setSystem: (system: string) => void;
    reservoir: string;
    setReservoir: (reservoir: string) => void;
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
}));

export default useMainStore;
