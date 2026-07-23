/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Box,
    Checkbox,
    Divider,
    Group,
    Loader,
    Select,
    Slider,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { BaseLayerOpacity, LayerId, MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { RasterBaseLayers } from '@/features/Map/types';
import { useEffect, useRef, useState } from 'react';
import useMainStore, { MainState } from '@/stores/main';
import {
    RasterVisibilityMap,
    updateBaseLayerOpacity,
} from '@/features/ReferenceData/utils';
import styles from '@/features/ReferenceData/ReferenceData.module.css';
import { Links } from '@/features/ReferenceData/Links';
import { Entry } from '@/features/ReferenceData/Entry';
import { getLayerName } from '@/features/Map/config';
import { useLoading } from '@/hooks/useLoading';
import Info from '@/icons/Info';
import { getBoundingGeographyLabel } from '@/utils/getBoundingGeographyLabel';
import { BoundingGeographyLevel } from '@/stores/main/types';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';

const RasterBaseLayerIconObj = [
    {
        id: RasterBaseLayers.Drought,
        friendlyName: getLayerName(LayerId.USDroughtMonitor),
    },
    {
        id: RasterBaseLayers.Precipitation,
        friendlyName: getLayerName(LayerId.NOAAPrecipSixToTen),
    },
    {
        id: RasterBaseLayers.Temperature,
        friendlyName: getLayerName(LayerId.NOAATempSixToTen),
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
const ReferenceData: React.FC = () => {
    const [baseLayerOpacity, setBaseLayerOpacity] = useState(BaseLayerOpacity);

    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const reservoirDate = useMainStore((state) => state.reservoirDate);
    const setToggleableLayers = useMainStore(
        (state) => state.setToggleableLayers
    );

    const [showUSBRCuratedNOAARFC, setShowUSBRCuratedNOAARFC] = useState(false);

    const { map } = useMap(MAP_ID);

    const { isGeneratingReport } = useLoading();

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

    const handleLayerVisibilityChange = (
        layerId: keyof MainState['toggleableLayers'],
        visible: boolean
    ) => {
        if (!map) {
            return;
        }

        setToggleableLayers(layerId, visible);
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

    useEffect(() => {
        if (!map) {
            return;
        }

        const filter = showUSBRCuratedNOAARFC
            ? ['boolean', ['get', 'is_usbr_curated']]
            : null;

        map.setFilter(LayerId.NOAARiverForecast, filter);
    }, [showUSBRCuratedNOAARFC]);

    // TODO: address through styling if bug occurs >1 place, assess if upgrade to next Mantine v
    // Work around, Mantine bug applies data-disabled styling even when false
    // const snotelSwitchProps = isFetchingSnotel ? { 'data-disabled': true } : {};

    const isReferenceDataDisabled =
        reservoirDate !== null || isGeneratingReport;

    const rasterLayerTooltip = getTooltipContent(getBaseLayerValue());

    return (
        <Stack
            className={styles.wrapper}
            gap="calc(var(--default-spacing) * 1.5)"
        >
            {map ? (
                <>
                    <Entry
                        layerId={LayerId.NOAARiverForecast}
                        label={`Show ${getLayerName(LayerId.NOAARiverForecast)}`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        disabled={isReferenceDataDisabled}
                    />
                    {toggleableLayers[LayerId.NOAARiverForecast] && (
                        <>
                            <Stack
                                ml="calc(var(--default-spacing) * 6)"
                                mb="var(--default-spacing)"
                            >
                                <Checkbox
                                    size="xs"
                                    classNames={{ label: styles.noaaSubLabel }}
                                    label={
                                        <Tooltip
                                            label="NOAA RFC seasonal water supply forecast points used by USBR for water supply operations planning."
                                            position="top-start"
                                            multiline
                                        >
                                            <Text size="sm" mt="-0.15rem">
                                                Only show points used by USBR
                                                for water supply forecasting
                                                <Box
                                                    ml="calc(var(--default-spacing) / 2)"
                                                    component="span"
                                                    className={styles.smallIcon}
                                                >
                                                    <Info />
                                                </Box>
                                            </Text>
                                        </Tooltip>
                                    }
                                    aria-label="Toggle active to show forecast points used by USBR for water supply operations planning."
                                    checked={showUSBRCuratedNOAARFC}
                                    onChange={() =>
                                        setShowUSBRCuratedNOAARFC(
                                            !showUSBRCuratedNOAARFC
                                        )
                                    }
                                    disabled={isReferenceDataDisabled}
                                />
                            </Stack>
                        </>
                    )}
                    <Entry
                        layerId={LayerId.Snotel}
                        label={`Show ${getLayerName(LayerId.Snotel)}`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        disabled={isReferenceDataDisabled}
                    />
                    <Divider size="md" />
                    <Stack gap="calc(var(--default-spacing) / 2)" w="100%">
                        <Select
                            id="baseLayerSelector"
                            data={RasterBaseLayerIconObj.map((obj) => ({
                                value: obj.id,
                                label: obj.friendlyName,
                                disabled:
                                    isReferenceDataDisabled &&
                                    [
                                        RasterBaseLayers.Drought,
                                        RasterBaseLayers.Precipitation,
                                        RasterBaseLayers.Temperature,
                                    ].includes(obj.id),
                            }))}
                            w="100%"
                            value={getBaseLayerValue()}
                            aria-label="Select a Base Layer"
                            placeholder="Select a Base Layer"
                            label={'Base Layer'}
                            description={
                                <Tooltip
                                    label={rasterLayerTooltip}
                                    disabled={!rasterLayerTooltip}
                                    position="top-start"
                                    multiline
                                >
                                    <Text size="sm" component="span">
                                        What is this?
                                        <Box
                                            ml="calc(var(--default-spacing) / 2)"
                                            component="span"
                                            style={{
                                                display: rasterLayerTooltip
                                                    ? 'inline-block'
                                                    : 'none',
                                            }}
                                            className={styles.dimmedIcon}
                                        >
                                            <Info />
                                        </Box>
                                    </Text>
                                </Tooltip>
                            }
                            onChange={(value) => {
                                if (value) {
                                    handleBaseLayerChange(
                                        value as RasterBaseLayers
                                    );
                                }
                            }}
                        />

                        {getBaseLayerValue() !== RasterBaseLayers.None && (
                            <Group>
                                <Links collectionId={getBaseLayerValue()} />
                            </Group>
                        )}
                    </Stack>
                    {getBaseLayerValue() !== RasterBaseLayers.None && (
                        <Stack gap="calc(var(--default-spacing) / 2)">
                            <Text size="sm">Base Layer Opacity</Text>
                            <Slider
                                min={0}
                                max={1}
                                step={0.05}
                                value={baseLayerOpacity}
                                onChange={handleBaseLayerOpacityChange}
                                label={(value) => `${Math.round(value * 100)}%`}
                                disabled={isReferenceDataDisabled}
                            />
                        </Stack>
                    )}
                    <Divider size="md" />
                    <Entry
                        layerId={LayerId.ManagingRegionsReference}
                        label={`Show ${getBoundingGeographyLabel(BoundingGeographyLevel.ManagingRegion)} Boundaries`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        links={{
                            apiLink:
                                'https://api.wwdh.internetofwater.app/collections/doi-reclamation-managing-regions',
                            sourceLink:
                                'https://www.arcgis.com/home/item.html?id=1835dcafa71c40eb81fb152406e41230#overview',
                        }}
                    />
                    <Entry
                        layerId={LayerId.RegionsReference}
                        label={`Show ${getBoundingGeographyLabel(BoundingGeographyLevel.Region)} Boundaries`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        links={{
                            apiLink:
                                'https://api.wwdh.internetofwater.app/collections/doi-regions/items',
                            sourceLink:
                                'https://services1.arcgis.com/ixD30sld6F8MQ7V5/ArcGIS/rest/services/DOI_12_Unified_Regions_20180801/FeatureServer/0',
                        }}
                    />
                    <Entry
                        layerId={LayerId.BasinsReference}
                        label={`Show ${getBoundingGeographyLabel(BoundingGeographyLevel.Basin)} Boundaries`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        links={{
                            apiLink:
                                'https://reference.geoconnex.us/collections/hu02',
                            sourceLink:
                                'https://www.usgs.gov/national-hydrography/access-national-hydrography-products',
                        }}
                    />
                    <Entry
                        layerId={LayerId.StatesReference}
                        label={`Show ${getBoundingGeographyLabel(BoundingGeographyLevel.State)} Boundaries`}
                        onClick={handleLayerVisibilityChange}
                        toggleableLayers={toggleableLayers}
                        links={{
                            apiLink:
                                'https://reference.geoconnex.us/collections/states',
                            sourceLink:
                                'https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html',
                        }}
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

export default ReferenceData;
