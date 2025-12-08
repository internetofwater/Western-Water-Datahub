/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { useRef } from 'react';
import { Divider, Modal, Stack } from '@mantine/core';
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
import useMainStore from '@/stores/main/main';
import { useDisclosure } from '@mantine/hooks';
import { ReservoirDefault } from '@/stores/main/consts';
import { GeoJsonProperties } from 'geojson';

/**
 *
 * @component
 */
const Reservoir: React.FC = () => {
    const [opened, { open, close }] = useDisclosure(false);

    const reservoir = useMainStore((state) => state.reservoir);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );

    const chartRef =
        useRef<ChartJS<'line', Array<{ x: string; y: number }>>>(null);

    const [reservoirProperties, setReservoirProperties] =
        useState<GeoJsonProperties>();
    const [reservoirId, setReservoirId] = useState<string | number>();
    const [config, setConfig] = useState<ReservoirConfig>();

    useEffect(() => {
        if (!reservoirCollections) {
            return;
        }

        if (reservoir !== ReservoirDefault) {
            const collection =
                reservoirCollections[reservoir.source as SourceId];

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
                    const properties = feature.properties;
                    const id = getReservoirIdentifier(
                        config,
                        feature.properties,
                        feature.id!
                    );

                    setReservoirId(id);

                    setReservoirProperties(properties);
                }
                open();
            }
        }
    }, [reservoir]);

    if (!reservoirProperties || !config || !reservoirId) {
        return null;
    }

    return (
        <Modal
            centered
            size="auto"
            styles={{
                content: {
                    width: 'min(80vw, 1265px)',
                    height: 800,
                    maxWidth: 1265,
                },
                body: {
                    height: 'min(80vh, 735px)',
                    maxHeight: 735,
                },
            }}
            opened={opened}
            onClose={close}
            title={String(reservoirProperties[config.labelProperty]) ?? ''}
        >
            <Stack gap="var(--default-spacing)">
                <Info
                    reservoirProperties={reservoirProperties}
                    config={config}
                />
                <Divider />
                <Chart id={reservoirId} ref={chartRef} config={config} />
            </Stack>
        </Modal>
    );
};

export default Reservoir;
