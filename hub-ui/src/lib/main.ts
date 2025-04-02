import { create } from 'zustand';

interface MainState {
    region: string;
    setRegion: (region: string) => void;
    basin: string;
    setBasin: (basin: string) => void;
    system: string;
    setSystem: (system: string) => void;
}

const useMainStore = create<MainState>()((set) => ({
    region: '',
    setRegion: (region) => set({ region }),
    basin: '',
    setBasin: (basin) => set({ basin }),
    system: '',
    setSystem: (system) => set({ system }),
}));

export default useMainStore;
