import useMainStore, { Tools } from '@/lib/main';
import { Selector } from './BaseMap/Selector';
import { Box } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { lazy } from 'react';

const Screenshot = lazy(() => import('./Screenshot/Screenshot'));

export const MapTools: React.FC = () => {
    const tools = useMainStore((state) => state.tools);

    return (
        <Box className={styles.mapToolsContainer}>
            {tools[Tools.BasemapSelector] && <Selector />}
            {tools[Tools.Print] && <Screenshot />}
        </Box>
    );
};
