/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Group,
    Loader,
    Select,
    Slider,
    Stack,
    Switch,
    Text,
    Divider,
} from '@mantine/core';
import { BaseLayerOpacity, LayerId, MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { RasterBaseLayers } from '@/features/Map/types';
import { useState } from 'react';
import useMainStore from '@/stores/main/main';
import {
    RasterVisibilityMap,
    updateBaseLayer,
    updateBaseLayerOpacity,
    updateNOAARFC,
    updateSnotel,
} from '@/features/Controls/utils';
import { ReservoirDateSelector } from '@/features/Controls/ReservoirDateSelector';
import styles from '@/features/Controls/Controls.module.css';
import { useLoading } from '@/hooks/useLoading';

const RasterBaseLayerIconObj = [
    {
        id: RasterBaseLayers.Drought,
        friendlyName: 'Drought',
    },
    {
        id: RasterBaseLayers.Precipitation,
        friendlyName: 'Precipitation',
    },
    {
        id: RasterBaseLayers.Temperature,
        friendlyName: 'Temperature',
    },
    {
        id: RasterBaseLayers.None,
        friendlyName: 'None',
    },
];

/**
 *
 * @component
 */
const Controls: React.FC = () => {
    const [baseLayerOpacity, setBaseLayerOpacity] = useState(BaseLayerOpacity);

    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const setToggleableLayers = useMainStore(
        (state) => state.setToggleableLayers
    );

    const { map } = useMap(MAP_ID);

    const { isFetchingSnotel } = useLoading();

    const handleBaseLayerChange = (baseLayer: RasterBaseLayers) => {
        if (!map) {
            return;
        }

        updateBaseLayer(baseLayer, map);

        const selectedVisibility = RasterVisibilityMap[baseLayer];

        Object.entries(selectedVisibility).forEach(([layerId, visibility]) => {
            setToggleableLayers(layerId as LayerId, visibility);
        });
    };

    const handleBaseLayerOpacityChange = (baseLayerOpacity: number) => {
        if (!map) {
            return;
        }

        updateBaseLayerOpacity(baseLayerOpacity, map);

        setBaseLayerOpacity(baseLayerOpacity);
    };

    const handleNOAARFCChange = (showNOAARFC: boolean) => {
        if (!map) {
            return;
        }
        updateNOAARFC(showNOAARFC, map);

        setToggleableLayers(LayerId.NOAARiverForecast, showNOAARFC);
        // setShowNOAARFC(showNOAARFC);
    };

    const handleSnotelChange = (showSnotel: boolean) => {
        if (!map) {
            return;
        }

        updateSnotel(showSnotel, map);

        setToggleableLayers(LayerId.Snotel, showSnotel);
        // setShowSnotel(showSnotel);
    };

    const getBaseLayerValue = (): RasterBaseLayers => {
        if (toggleableLayers[RasterBaseLayers.Drought]) {
            return RasterBaseLayers.Drought;
        }
        if (toggleableLayers[RasterBaseLayers.Precipitation]) {
            return RasterBaseLayers.Precipitation;
        }
        if (toggleableLayers[RasterBaseLayers.Temperature]) {
            return RasterBaseLayers.Temperature;
        }
        return RasterBaseLayers.None;
    };

    // TODO: address through styling if bug occurs >1 place, assess if upgrade to next Mantine v
    // Work around, Mantine bug applies data-disabled styling even when false
    const snotelSwitchProps = isFetchingSnotel ? { 'data-disabled': true } : {};

    return (
        <Stack>
            {map ? (
                <>
                    <ReservoirDateSelector />
                    <Divider mx="xl" />
                    <Text size="md" fw={500}>
                        Reference Data
                    </Text>
                    <Switch
                        label="Show River Forecast Points (NOAA RFC)"
                        checked={toggleableLayers[LayerId.NOAARiverForecast]}
                        onClick={() =>
                            handleNOAARFCChange(
                                !toggleableLayers[LayerId.NOAARiverForecast]
                            )
                        }
                    />
                    <Switch
                        label="Show Snow Water Equivalent Averages (NRCS SNOTEL)"
                        disabled={isFetchingSnotel}
                        checked={toggleableLayers[LayerId.Snotel]}
                        onClick={() =>
                            handleSnotelChange(
                                !toggleableLayers[LayerId.Snotel]
                            )
                        }
                        {...snotelSwitchProps}
                    />
                    <Select
                        id="baseLayerSelector"
                        data={RasterBaseLayerIconObj.map((obj) => ({
                            value: obj.id,
                            label: obj.friendlyName,
                        }))}
                        value={getBaseLayerValue()}
                        aria-label="Select a Base Layer"
                        placeholder="Select a Base Layer"
                        label="Base Layer"
                        className={styles.baseLayerSelector}
                        onChange={(_value) =>
                            handleBaseLayerChange(_value as RasterBaseLayers)
                        }
                    />
                    {getBaseLayerValue() !== RasterBaseLayers.None && (
                        <Stack gap="xs">
                            <Text size="sm">Base Layer Opacity</Text>
                            <Slider
                                min={0}
                                max={1}
                                step={0.05}
                                value={baseLayerOpacity}
                                onChange={handleBaseLayerOpacityChange}
                                label={(value) => `${Math.round(value * 100)}%`}
                            />
                        </Stack>
                    )}
                </>
            ) : (
                <Group justify="center" align="center">
                    <Loader />
                </Group>
            )}
        </Stack>
    );
};

export default Controls;
