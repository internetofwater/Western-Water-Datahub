/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Box,
    Grid,
    GridCol,
    Paper,
} from '@mantine/core';
import Map from '@/features/Map';
import useMainStore from '@/lib/main';
import styles from '@/features/Main/Main.module.css';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { useEffect } from 'react';
import { MapTools } from '@/features/MapTools';
import Reservoir from '@/features/Reservior';
import { ReservoirDefault } from '@/lib/consts';
import Controls from '../Controls';
import Legend from '../Legend';

type Props = {
    accessToken: string;
};

/**

 * @component
 */
const Main: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const region = useMainStore((state) => state.region);
    const basin = useMainStore((state) => state.basin);
    const reservoir = useMainStore((state) => state.reservoir);

    const { map } = useMap(MAP_ID);

    const hasSelectedReservoir = reservoir !== ReservoirDefault;
    // Whenever reservoir or region change, resize map
    useEffect(() => {
        if (!map) {
            return;
        }
        map.resize();
    }, [reservoir, region, basin]);

    return (
        <Grid
            style={{ height: 'inherit', flex: 1, marginBottom: '-8px' }}
            styles={{
                inner: {
                    height: '100%',
                },
            }}
        >
            <GridCol span={{ base: 12, md: 3 }} order={{ base: 2, md: 1 }}>
                <Paper shadow="xs" p="0">
                    <Box
                        className={
                            hasSelectedReservoir
                                ? styles.sideContainerSmall
                                : styles.sideContainer
                        }
                        p="sm"
                    >
                        <Accordion
                            multiple
                            defaultValue={['controls', 'legend']}
                        >
                            <AccordionItem value="controls">
                                <AccordionControl>Controls</AccordionControl>
                                <AccordionPanel>
                                    <Controls />
                                </AccordionPanel>
                            </AccordionItem>
                            <AccordionItem value="legend">
                                <AccordionControl>Legend</AccordionControl>
                                <AccordionPanel>
                                    <Legend />
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Box>
                </Paper>
            </GridCol>
            <GridCol span={{ base: 12, md: 9 }} order={{ base: 1, md: 2 }}>
                <Box
                    className={
                        hasSelectedReservoir
                            ? styles.mapContainerSmall
                            : styles.mapContainer
                    }
                >
                    <Map accessToken={accessToken} />
                    <MapTools />
                </Box>
            </GridCol>
            {hasSelectedReservoir && (
                <Reservoir reservoir={reservoir} accessToken={accessToken} />
            )}
        </Grid>
    );
};

export default Main;
