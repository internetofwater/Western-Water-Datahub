/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { useRef } from 'react';
import { GridCol, Paper } from '@mantine/core';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useMap } from '@/contexts/MapContexts';
import { useEffect, useState } from 'react';
import {
    ReservoirPropertiesRaw,
    ReservoirIdentifierField,
    ReservoirProperties,
} from '@/features/Map/types';
import { parseReservoirProperties } from '@/features/Map/utils';
import { Chart } from '@/features/Reservior/Chart';
import { Chart as ChartJS } from 'chart.js';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Info } from '@/features/Reservior/Info';

type Props = {
    reservoir: string;
    accessToken: string;
};

/**
 *
 * @component
 */
const Reservoir: React.FC<Props> = (props) => {
    const { reservoir, accessToken } = props;

    const { map } = useMap(MAP_ID);
    const chartRef =
        useRef<ChartJS<'line', Array<{ x: string; y: number }>>>(null);

    const [reservoirProperties, setReservoirProperties] =
        useState<ReservoirProperties>();
    const [center, setCenter] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!map) {
            return;
        }

        const features = map.querySourceFeatures(SourceId.Reservoirs, {
            sourceLayer: SourceId.Reservoirs,
            filter: ['==', ['get', ReservoirIdentifierField], reservoir],
        });

        if (features.length) {
            const feature = features[0] as Feature<Point, GeoJsonProperties>;
            const properties = feature.properties as ReservoirPropertiesRaw;

            setCenter(feature.geometry.coordinates as [number, number]);
            const reservoirProperties = Object.entries(
                properties
            ).reduce<ReservoirProperties>((acc, [key, value]) => {
                const typedKey = key as keyof ReservoirPropertiesRaw;
                const parsedValue = parseReservoirProperties(typedKey, value);
                return {
                    ...acc,
                    [typedKey]: parsedValue,
                };
            }, {} as ReservoirProperties);

            setReservoirProperties(reservoirProperties);
        }
    }, [map, reservoir]);

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
                        <Chart id={reservoirProperties._id} ref={chartRef} />
                    </GridCol>
                    <GridCol span={{ base: 12, md: 4 }} order={5}>
                        <Paper shadow="xs" p="xl">
                            Average
                        </Paper>
                    </GridCol>
                </>
            )}
        </>
    );
};

export default Reservoir;
