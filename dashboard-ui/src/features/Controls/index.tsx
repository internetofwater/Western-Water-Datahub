/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Loader, Select, Slider, Stack, Text } from '@mantine/core';
import { BaseLayerOpacity, LayerId, MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { RasterBaseLayers } from '@/features/Map/types';
import { useEffect, useRef, useState } from 'react';
import useMainStore from '@/stores/main';
import {
    RasterVisibilityMap,
    updateBaseLayer,
    updateBaseLayerOpacity,
    updateNOAARFC,
    updateSnotel,
} from '@/features/Controls/utils';
import styles from '@/features/Controls/Controls.module.css';
import { Links } from '@/features/Controls/Links';
import { Entry } from '@/features/Controls/Entry';

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

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

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

    const handleRegionsReferenceChange = (showRegionsReference: boolean) => {
        if (!map) {
            return;
        }
        const visibility = showRegionsReference ? 'visible' : 'none';

        map.setLayoutProperty(
            LayerId.RegionsReference,
            'visibility',
            visibility
        );

        setToggleableLayers(LayerId.RegionsReference, showRegionsReference);
    };

    const handleBasinsReferenceChange = (showBasinsReference: boolean) => {
        if (!map) {
            return;
        }
        const visibility = showBasinsReference ? 'visible' : 'none';

        map.setLayoutProperty(
            LayerId.BasinsReference,
            'visibility',
            visibility
        );

        setToggleableLayers(LayerId.BasinsReference, showBasinsReference);
    };

    const handleStatesReferenceChange = (showStatesReference: boolean) => {
        if (!map) {
            return;
        }
        const visibility = showStatesReference ? 'visible' : 'none';

        map.setLayoutProperty(
            LayerId.StatesReference,
            'visibility',
            visibility
        );

        setToggleableLayers(LayerId.StatesReference, showStatesReference);
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
    // const snotelSwitchProps = isFetchingSnotel ? { 'data-disabled': true } : {};

    return (
        <Stack
            className={styles.wrapper}
            gap="calc(var(--default-spacing) * 1.5)"
        >
            {map ? (
                <>
                    <Entry
                        layerId={LayerId.NOAARiverForecast}
                        label="Show River Forecast Points (NOAA RFC)"
                        onClick={handleNOAARFCChange}
                        toggleableLayers={toggleableLayers}
                    />
                    <Entry
                        layerId={LayerId.Snotel}
                        label="Show Snow Water Equivalent Averages (NRCS SNOTEL)"
                        onClick={handleSnotelChange}
                        toggleableLayers={toggleableLayers}
                    />

                    <Stack gap="calc(var(--default-spacing) / 2)">
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
                                handleBaseLayerChange(
                                    _value as RasterBaseLayers
                                )
                            }
                        />

                        {getBaseLayerValue() !== RasterBaseLayers.None && (
                            <Links collectionId={getBaseLayerValue()} />
                        )}
                    </Stack>
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
                    <Entry
                        layerId={LayerId.RegionsReference}
                        label="Show DOI Region Boundaries"
                        onClick={handleRegionsReferenceChange}
                        toggleableLayers={toggleableLayers}
                        links={false}
                    />
                    <Entry
                        layerId={LayerId.BasinsReference}
                        label="Show Basin (HUC06) Boundaries"
                        onClick={handleBasinsReferenceChange}
                        toggleableLayers={toggleableLayers}
                        links={false}
                    />
                    <Entry
                        layerId={LayerId.StatesReference}
                        label="Show State Boundaries"
                        onClick={handleStatesReferenceChange}
                        toggleableLayers={toggleableLayers}
                        links={false}
                    />
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
