import { GridCol, Paper, Text } from '@mantine/core';
import { MAP_ID, SourceId } from '@/features/Map/config';
import { useMap } from '@/contexts/MapContexts';
import { useEffect, useState } from 'react';
import {
    ReservoirPropertiesRaw,
    ReservoirIdentifierField,
    ReservoirProperties,
} from '@/features/Map/types';
import { parseReservoirProperties } from '@/features/Map/utils';
import { Chart } from './Chart';

type Props = {
    reservoir: string;
};

/**
 *
 * @component
 */
const Reservoir: React.FC<Props> = (props) => {
    const { reservoir } = props;

    const { map } = useMap(MAP_ID);

    const [reservoirProperties, setReservoirProperties] =
        useState<ReservoirProperties>();

    useEffect(() => {
        if (!map) {
            return;
        }

        const features = map.querySourceFeatures(SourceId.Reservoirs, {
            sourceLayer: SourceId.Reservoirs,
            filter: ['==', ['get', ReservoirIdentifierField], reservoir],
        });

        if (features.length) {
            const feature = features[0];
            const properties = feature.properties as ReservoirPropertiesRaw;

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
            <GridCol span={{ base: 12, md: 4 }} order={3}>
                <Paper shadow="xs" p="xl">
                    <Text>Reservoir Info</Text>
                </Paper>
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }} order={4}>
                {reservoirProperties && <Chart id={reservoirProperties._id} />}
            </GridCol>
            <GridCol span={{ base: 12, md: 4 }} order={5}>
                <Paper shadow="xs" p="xl">
                    Average
                </Paper>
            </GridCol>
        </>
    );
};

export default Reservoir;
