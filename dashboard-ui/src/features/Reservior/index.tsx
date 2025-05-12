/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { useRef } from 'react';
import { GridCol, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReservoirProperties } from '@/features/Map/types';
import { ReservoirIdentifierField } from '@/features/Map/consts';
import { Chart } from '@/features/Reservior/Chart';
import { Chart as ChartJS } from 'chart.js';
import { Info } from '@/features/Reservior/Info';
import styles from '@/features/Reservior/Reservoir.module.css';
import useMainStore from '@/lib/main';

type Props = {
    reservoir: number;
    accessToken: string;
};

/**
 *
 * @component
 */
const Reservoir: React.FC<Props> = (props) => {
    const { reservoir, accessToken } = props;

    const reservoirCollection = useMainStore(
        (state) => state.reservoirCollection
    );

    const chartRef =
        useRef<ChartJS<'line', Array<{ x: string; y: number }>>>(null);

    const [reservoirProperties, setReservoirProperties] =
        useState<ReservoirProperties>();
    const [center, setCenter] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!reservoirCollection) {
            return;
        }

        const features = reservoirCollection.features.filter(
            (feature) =>
                feature.properties[ReservoirIdentifierField] === reservoir
        );

        if (features.length) {
            const feature = features[0];
            const properties = feature.properties;

            setCenter(feature.geometry.coordinates as [number, number]);

            setReservoirProperties(properties);
        }
    }, [reservoir]);

    return (
        <>
            {reservoirProperties && (
                <>
                    <GridCol span={{ base: 12, md: 4 }} order={3}>
                        <Info
                            reservoirProperties={reservoirProperties}
                            accessToken={accessToken}
                            center={center}
                            chartRef={chartRef}
                        />
                    </GridCol>
                    <GridCol span={{ base: 12, md: 4 }} order={4}>
                        <Paper
                            shadow="xs"
                            p="xl"
                            className={styles.infoContainer}
                        >
                            Average
                        </Paper>
                    </GridCol>
                    <GridCol span={{ base: 12, md: 4 }} order={5}>
                        <Chart id={reservoirProperties._id} ref={chartRef} />
                    </GridCol>
                </>
            )}
        </>
    );
};

export default Reservoir;
