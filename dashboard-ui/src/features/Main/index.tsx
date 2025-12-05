/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Box } from '@mantine/core';
import Map from '@/features/Map';
import styles from '@/features/Main/Main.module.css';
import { MapTools } from '@/features/MapTools';
import Panel from '../Panel';
import Popups from '../Popups';
import Reservoir from '../Reservior';

type Props = {
    accessToken: string;
};

/**

 * @component
 */
const Main: React.FC<Props> = (props) => {
    const { accessToken } = props;

    return (
        <>
            <Panel />
            <Box className={styles.mapContainer}>
                <Map accessToken={accessToken} />
                <Box className={`${styles.container} ${styles.right}`}>
                    <MapTools />
                </Box>
                <Box
                    className={`${styles.container} ${styles.left} ${styles.bottom}`}
                >
                    <Popups />
                </Box>
            </Box>
            <Reservoir />
        </>
    );
};

export default Main;
