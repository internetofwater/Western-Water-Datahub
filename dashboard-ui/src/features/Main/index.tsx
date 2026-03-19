/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Box, Group, Stack } from '@mantine/core';
import Map from '@/features/Map';
import styles from '@/features/Main/Main.module.css';
import { MapTools } from '@/features/MapTools';
import Panel from '@/features/Panel';
import Popups from '@/features/Popups';
import Reservoir from '@/features/Reservior';
import Loading from '../Loading';

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
            <Stack gap={0} className={styles.contentWrapper}>
                <Group
                    gap={0}
                    align="flex-start"
                    className={styles.primaryWrapper}
                >
                    <Panel accessToken={accessToken} />
                    <Stack gap={0} className={styles.right}>
                        <Map accessToken={accessToken} />
                        <Box
                            className={`${styles.container} ${styles.left} ${styles.bottom}`}
                        >
                            <Popups />
                        </Box>
                        <Loading desktop />
                    </Stack>
                </Group>
            </Stack>
            <MapTools />
            <Reservoir />
        </>
    );
};

export default Main;
