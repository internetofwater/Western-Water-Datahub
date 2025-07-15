/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Card,
    CardSection,
    CloseButton,
    Group,
    Loader,
    Select,
    Slider,
    Stack,
    Switch,
    Title,
    Text,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { BaseLayerOpacity, MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { RasterBaseLayers } from '@/features/Map/types';
import { useState } from 'react';
import useMainStore, { Tools } from '@/lib/main';
import {
    updateBaseLayer,
    updateBaseLayerOpacity,
    updateNOAARFC,
    updateSnotel,
    updateTeacups,
} from '@/features/MapTools/Controls/utils';

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
    const [baseLayerOpacity, setBaseLayerOpacity] = useState(BaseLayerOpacity);
    const [showTeacups, setShowTeacups] = useState(true);
    const [showNOAARFC, setShowNOAARFC] = useState(false);
    const [showSnotel, setShowSnotel] = useState(false);

    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const { map } = useMap(MAP_ID);

    const handleBaseLayerChange = (baseLayer: RasterBaseLayers) => {
        if (!map) {
            return;
        }

        updateBaseLayer(baseLayer, map);

        setBaseLayer(baseLayer);
    };

    const handleBaseLayerOpacityChange = (baseLayerOpacity: number) => {
        if (!map) {
            return;
        }

        updateBaseLayerOpacity(baseLayerOpacity, map);

        setBaseLayerOpacity(baseLayerOpacity);
    };

    const handleTeacupChange = (showTeacups: boolean) => {
        if (!map) {
            return;
        }

        updateTeacups(showTeacups, map);

        setShowTeacups(showTeacups);
    };

    const handleNOAARFCChange = (showNOAARFC: boolean) => {
        if (!map) {
            return;
        }
        updateNOAARFC(showNOAARFC, map);

        setShowNOAARFC(showNOAARFC);
    };

    const handleSnotelChange = (showSnotel: boolean) => {
        if (!map) {
            return;
        }

        updateSnotel(showSnotel, map);

        setShowSnotel(showSnotel);
    };

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
            {map ? (
                <CardSection inheritPadding py="md">
                    <Stack>
                        <Switch
                            label="Show Teacups"
                            checked={showTeacups}
                            onClick={() => handleTeacupChange(!showTeacups)}
                        />
                        <Switch
                            label="Show NOAA RFC"
                            checked={showNOAARFC}
                            onClick={() => handleNOAARFCChange(!showNOAARFC)}
                        />
                        <Switch
                            label="Show Snotel"
                            checked={showSnotel}
                            onClick={() => handleSnotelChange(!showSnotel)}
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
                                handleBaseLayerChange(
                                    _value as RasterBaseLayers
                                )
                            }
                        />
                        <Stack gap="xs">
                            <Text size="sm">Base Layer Opacity</Text>
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={baseLayerOpacity}
                                onChange={handleBaseLayerOpacityChange}
                                label={(value) => value.toFixed(1)}
                            />
                        </Stack>
                    </Stack>
                </CardSection>
            ) : (
                <Group w={200} h={100} justify="center" align="center">
                    <Loader />
                </Group>
            )}
        </Card>
    );
};

export default Controls;
