/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { useRef } from 'react';
import { GridCol } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReservoirConfig } from '@/features/Map/types';
import { SourceId } from '@/features/Map/consts';
import {
    getReservoirConfig,
    getReservoirIdentifier,
    isReservoirIdentifier,
} from '@/features/Map/utils';
import { Chart } from '@/features/Reservior/Chart';
import { Chart as ChartJS } from 'chart.js';
import Info from '@/features/Reservior/Info';
import useMainStore, { Reservoir as ReservoirType } from '@/lib/main';
import { RiseReservoirProperties } from '@/features/Map/types/reservoir/rise';

type Props = {
    reservoir: ReservoirType;
    accessToken: string;
};

/**
 *
 * @component
 */
const Reservoir: React.FC<Props> = (props) => {
    const { reservoir, accessToken } = props;

    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );

    const chartRef =
        useRef<ChartJS<'line', Array<{ x: string; y: number }>>>(null);

    const [reservoirProperties, setReservoirProperties] =
        useState<RiseReservoirProperties>();
    const [reservoirId, setReservoirId] = useState<string | number>();
    const [config, setConfig] = useState<ReservoirConfig>();
    const [center, setCenter] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!reservoirCollections) {
            return;
        }

        const collection = reservoirCollections[reservoir.source as SourceId];

        const config = getReservoirConfig(reservoir.source as SourceId);

        if (collection && config) {
            setConfig(config);

            const features = collection.features.filter((feature) =>
                isReservoirIdentifier(
                    config,
                    feature.properties,
                    feature.id!,
                    reservoir.identifier
                )
            );

            if (features.length) {
                const feature = features[0];
                const properties =
                    feature.properties as RiseReservoirProperties;
                const id = getReservoirIdentifier(
                    config,
                    feature.properties,
                    feature.id!
                );

                setReservoirId(id);
                setCenter(feature.geometry.coordinates as [number, number]);

                setReservoirProperties(properties);
            }
        }
    }, [reservoir]);

    return (
        <>
            {reservoirProperties && config && (
                <>
                    <GridCol span={{ sm: 12, lg: 7 }} order={3}>
                        <Info
                            reservoirProperties={reservoirProperties}
                            accessToken={accessToken}
                            center={center}
                            chartRef={chartRef}
                            config={config}
                        />
                    </GridCol>
                    <GridCol span={{ sm: 12, lg: 5 }} order={5}>
                        {reservoirId && (
                            <Chart
                                id={reservoirId}
                                ref={chartRef}
                                config={config}
                            />
                        )}
                    </GridCol>
                </>
            )}
        </>
    );
};

export default Reservoir;
