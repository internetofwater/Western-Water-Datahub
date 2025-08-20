/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
'use client';

import { Box, Divider, Group, Paper } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';
import { Region } from '@/features/Header/Selectors/Region';
import { Reservoir } from '@/features/Header/Selectors/Reservoir';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Basin } from '@/features/Header/Selectors/Basin';
import { ClearAll } from '@/features/Header/Selectors/ClearAll';
import useMainStore from '@/lib/main';
import { State } from '@/features/Header/Selectors/State';
import {
    BasinDefault,
    RegionDefault,
    ReservoirDefault,
    StateDefault,
} from '@/lib/consts';
import { BoundingGeographyLevel } from '@/lib/types';
import { BoundingGeography } from '@/features/Header/Selectors/BoundingGeography';

const DarkModeToggle = dynamic(() => import('./DarkModeToggle'), {
    ssr: false,
});

/**

 * @component
 */
const Header: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const reservoir = useMainStore((state) => state.reservoir);
    const basin = useMainStore((state) => state.basin);
    const state = useMainStore((state) => state.state);
    const boundingGeographyLevel = useMainStore(
        (state) => state.boundingGeographyLevel
    );

    return (
        <Box component="div" className={styles.topBarContainer}>
            <Paper
                radius={0}
                shadow="xs"
                className={`${styles.topBarPaper} ${styles.logoBarPaper}`}
            >
                <Group justify="space-between" align="center">
                    <Group>
                        <Box
                            component="span"
                            darkHidden
                            className={styles.logoContainer}
                        >
                            <Image
                                src={'/BofR-logo-dark.png'}
                                alt="United States Bureau of Reclamation Logo"
                                width={157}
                                height={50}
                            />
                        </Box>
                        <Box
                            component="span"
                            lightHidden
                            className={styles.logoContainer}
                        >
                            <Image
                                src={'/BofR-logo-white.png'}
                                alt="United States Bureau of Reclamation Logo"
                                width={157}
                                height={50}
                            />
                        </Box>

                        <Divider
                            orientation="vertical"
                            className={styles.headerDivider}
                        />
                        <Group>
                            <BoundingGeography />
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.Region
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <Region />
                            </Box>
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.Basin
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <Basin />
                            </Box>
                            <Box
                                style={{
                                    display:
                                        boundingGeographyLevel ===
                                        BoundingGeographyLevel.State
                                            ? 'block'
                                            : 'none',
                                }}
                            >
                                <State />
                            </Box>
                            <Divider
                                orientation="vertical"
                                className={styles.selectorDivider}
                            />
                            <Reservoir />

                            {(region !== RegionDefault ||
                                reservoir !== ReservoirDefault ||
                                basin !== BasinDefault ||
                                state !== StateDefault) && <ClearAll />}
                        </Group>
                    </Group>
                    <Suspense>
                        <DarkModeToggle />
                    </Suspense>
                </Group>
            </Paper>
        </Box>
    );
};

export default Header;
