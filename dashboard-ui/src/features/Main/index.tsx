'use client';

import { Box, Grid, GridCol, Paper, Text } from '@mantine/core';
import Map from '@/features/Map';
import useMainStore from '@/lib/main';
import styles from '@/features/Main/Main.module.css';
import { MAP_ID } from '@/features/Map/config';
import { useMap } from '@/contexts/MapContexts';
import { useEffect } from 'react';

type Props = {
    accessToken: string;
};

const Main: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const region = useMainStore((state) => state.region);
    const basin = useMainStore((state) => state.basin);
    const reservoir = useMainStore((state) => state.reservoir);

    const { map } = useMap(MAP_ID);

    const hasSelectedRegionOrBasin = region !== 'all' || basin !== 'all';
    const hasSelectedReservoir = reservoir !== 'all';
    // Whenever reservoir or region change, resize map
    useEffect(() => {
        if (!map) {
            return;
        }

        map.resize();
    }, [reservoir, region, basin]);

    return (
        <Grid grow>
            {hasSelectedRegionOrBasin && (
                <GridCol span={{ base: 12, md: 3 }}>
                    <Grid grow>
                        <GridCol span={{ base: 12 }}>
                            <Paper shadow="xs" p="xl">
                                <Text>Region Info</Text>
                            </Paper>
                        </GridCol>
                        <GridCol span={{ base: 12 }}>
                            <Paper shadow="xs" p="xl">
                                Summary
                            </Paper>
                        </GridCol>
                    </Grid>
                </GridCol>
            )}
            <GridCol span={hasSelectedRegionOrBasin ? 9 : 12}>
                <Box
                    className={
                        hasSelectedReservoir
                            ? styles.mapContainerSmall
                            : styles.mapContainerLarge
                    }
                >
                    <Map accessToken={accessToken} />
                </Box>
            </GridCol>
            {hasSelectedReservoir && (
                <>
                    <GridCol span={{ base: 12, md: 4 }}>
                        <Paper shadow="xs" p="xl">
                            <Text>Reservoir Info</Text>
                        </Paper>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 4 }}>
                        <Paper shadow="xs" p="xl">
                            <Text>Chart</Text>
                        </Paper>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 4 }}>
                        <Paper shadow="xs" p="xl">
                            Average
                        </Paper>
                    </GridCol>
                </>
            )}
        </Grid>
    );
};

export default Main;
