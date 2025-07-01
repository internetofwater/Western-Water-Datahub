/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Card,
    CardSection,
    CloseButton,
    Group,
    Select,
    Stack,
    Switch,
    Title,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { LayerId, MAP_ID, ReservoirConfigs } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { RasterBaseLayers } from '@/features/Map/types';
import { useEffect, useState } from 'react';
import useMainStore, { Tools } from '@/lib/main';
import { getReservoirIconImageExpression } from '@/features/Map/utils';

const RasterBaseLayerIconObj = [
    {
        id: RasterBaseLayers.Drought,
        friendlyName: 'Drought',
        symbol: <></>,
    },
    {
        id: RasterBaseLayers.Precipitation,
        friendlyName: 'Precipitation',
        symbol: <></>,
    },
    {
        id: RasterBaseLayers.Temperature,
        friendlyName: 'Temperature',
        symbol: <></>,
    },
    {
        id: RasterBaseLayers.None,
        friendlyName: 'None',
        symbol: <></>,
    },
];

/**
 *
 * @component
 */
const Controls: React.FC = () => {
    const [baseLayer, setBaseLayer] = useState<RasterBaseLayers>(
        RasterBaseLayers.Drought
    );
    const [showTeacups, setShowTeacups] = useState(true);

    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const { map } = useMap(MAP_ID);

    const handleChange = (value: RasterBaseLayers) => {
        if (!map) {
            return;
        }

        if (value === RasterBaseLayers.Drought) {
            map.setLayoutProperty(
                LayerId.USDroughtMonitor,
                'visibility',
                'visible'
            );
            map.setLayoutProperty(
                LayerId.NOAAPrecipSixToTen,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAATempSixToTen,
                'visibility',
                'none'
            );
        } else if (value === RasterBaseLayers.Precipitation) {
            map.setLayoutProperty(
                LayerId.USDroughtMonitor,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAAPrecipSixToTen,
                'visibility',
                'visible'
            );
            map.setLayoutProperty(
                LayerId.NOAATempSixToTen,
                'visibility',
                'none'
            );
        } else if (value === RasterBaseLayers.Temperature) {
            map.setLayoutProperty(
                LayerId.USDroughtMonitor,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAAPrecipSixToTen,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAATempSixToTen,
                'visibility',
                'visible'
            );
        } else {
            map.setLayoutProperty(
                LayerId.USDroughtMonitor,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAAPrecipSixToTen,
                'visibility',
                'none'
            );
            map.setLayoutProperty(
                LayerId.NOAATempSixToTen,
                'visibility',
                'none'
            );
        }

        setBaseLayer(value);
    };

    useEffect(() => {
        if (!map) {
            return;
        }
        if (showTeacups) {
            ReservoirConfigs.forEach((config) =>
                config.connectedLayers
                    .filter((layerId) =>
                        [LayerId.RiseEDRReservoirs].includes(layerId as LayerId)
                    )
                    .forEach((layerId) =>
                        map.setLayoutProperty(
                            layerId,
                            'icon-image',
                            getReservoirIconImageExpression(config)
                        )
                    )
            );
        } else {
            ReservoirConfigs.forEach((config) =>
                config.connectedLayers
                    .filter((layerId) =>
                        [LayerId.RiseEDRReservoirs].includes(layerId as LayerId)
                    )
                    .forEach((layerId) =>
                        map.setLayoutProperty(layerId, 'icon-image', 'default')
                    )
            );
        }
    }, [showTeacups]);

    return (
        <Card
            withBorder
            shadow="sm"
            radius="md"
            padding="md"
            className={styles.controlsContainer}
        >
            <CardSection withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Title order={3} className={styles.mapToolTitle}>
                        Controls
                    </Title>
                    <CloseButton
                        onClick={() => setOpenTools(Tools.Controls, false)}
                        aria-label="Close Controls"
                    />
                </Group>
            </CardSection>
            <CardSection inheritPadding py="md">
                <Stack>
                    <Switch
                        label="Show Teacups"
                        checked={showTeacups}
                        onClick={() => setShowTeacups(!showTeacups)}
                    />
                    <Select
                        id="basinSelector"
                        data={RasterBaseLayerIconObj.map((obj) => ({
                            value: obj.id,
                            label: obj.friendlyName,
                        }))}
                        value={baseLayer}
                        aria-label="Select a Base Layer"
                        placeholder="Select a Base Layer"
                        onChange={(_value) =>
                            handleChange(_value as RasterBaseLayers)
                        }
                    />
                </Stack>
            </CardSection>
        </Card>
    );
};

export default Controls;
