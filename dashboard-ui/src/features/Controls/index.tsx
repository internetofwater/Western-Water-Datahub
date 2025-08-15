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
import useMainStore from '@/lib/main';
import {
    RasterVisibilityMap,
    updateBaseLayer,
    updateBaseLayerOpacity,
    updateNOAARFC,
    updateSnotel,
    updateTeacups,
} from '@/features/Controls/utils';
import { ReservoirDateSelector } from '@/features/Controls/ReservoirDateSelector';

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
    const [showTeacups, setShowTeacups] = useState(true);

    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const setToggleableLayers = useMainStore(
        (state) => state.setToggleableLayers
    );

    const { map } = useMap(MAP_ID);

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

    return (
        <Stack>
            {map ? (
                <>
                    <Stack>
                        <ReservoirDateSelector />
                    </Stack>
                    <Divider mx="xl" />
                    <Switch
                        label="Show Teacups"
                        checked={showTeacups}
                        onClick={() => handleTeacupChange(!showTeacups)}
                    />
                    <Switch
                        label="Show NOAA RFC"
                        checked={toggleableLayers[LayerId.NOAARiverForecast]}
                        onClick={() =>
                            handleNOAARFCChange(
                                !toggleableLayers[LayerId.NOAARiverForecast]
                            )
                        }
                    />
                    <Switch
                        label="Show Snotel"
                        checked={toggleableLayers[LayerId.Snotel]}
                        onClick={() =>
                            handleSnotelChange(
                                !toggleableLayers[LayerId.Snotel]
                            )
                        }
                    />
                    <Select
                        id="basinSelector"
                        data={RasterBaseLayerIconObj.map((obj) => ({
                            value: obj.id,
                            label: obj.friendlyName,
                        }))}
                        value={getBaseLayerValue()}
                        aria-label="Select a Base Layer"
                        placeholder="Select a Base Layer"
                        label="Base Layer"
                        onChange={(_value) =>
                            handleBaseLayerChange(_value as RasterBaseLayers)
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
                </>
            ) : (
                <Group justify="center" align="center">
                    <Loader />
                </Group>
            )}
        </Stack>

        // <Card
        //     withBorder
        //     shadow="sm"
        //     radius="md"
        //     padding="md"
        //     className={styles.controlsContainer}
        // >
        //     <CardSection withBorder inheritPadding py="xs">
        //         <Group justify="space-between">
        //             <Title order={3} className={styles.mapToolTitle}>
        //                 Controls
        //             </Title>
        //             <CloseButton
        //                 onClick={() => setOpenTools(Tools.Controls, false)}
        //                 aria-label="Close Controls"
        //             />
        //         </Group>
        //     </CardSection>
        //     {map ? (
        //         <CardSection
        //             inheritPadding
        //             py="md"
        //             className={styles.toolContent}
        //         >
        //             <Stack>
        //                 <Stack>
        //                     <ReservoirDateSelector />
        //                 </Stack>
        //                 <Divider />
        //                 <Switch
        //                     label="Show Teacups"
        //                     checked={showTeacups}
        //                     onClick={() => handleTeacupChange(!showTeacups)}
        //                 />
        //                 <Switch
        //                     label="Show NOAA RFC"
        //                     checked={
        //                         toggleableLayers[LayerId.NOAARiverForecast]
        //                     }
        //                     onClick={() =>
        //                         handleNOAARFCChange(
        //                             !toggleableLayers[LayerId.NOAARiverForecast]
        //                         )
        //                     }
        //                 />
        //                 <Switch
        //                     label="Show Snotel"
        //                     checked={toggleableLayers[LayerId.Snotel]}
        //                     onClick={() =>
        //                         handleSnotelChange(
        //                             !toggleableLayers[LayerId.Snotel]
        //                         )
        //                     }
        //                 />
        //                 <Select
        //                     id="basinSelector"
        //                     data={RasterBaseLayerIconObj.map((obj) => ({
        //                         value: obj.id,
        //                         label: obj.friendlyName,
        //                     }))}
        //                     value={getBaseLayerValue()}
        //                     aria-label="Select a Base Layer"
        //                     placeholder="Select a Base Layer"
        //                     label="Base Layer"
        //                     onChange={(_value) =>
        //                         handleBaseLayerChange(
        //                             _value as RasterBaseLayers
        //                         )
        //                     }
        //                 />
        //                 <Stack gap="xs">
        //                     <Text size="sm">Base Layer Opacity</Text>
        //                     <Slider
        //                         min={0}
        //                         max={1}
        //                         step={0.1}
        //                         value={baseLayerOpacity}
        //                         onChange={handleBaseLayerOpacityChange}
        //                         label={(value) => value.toFixed(1)}
        //                     />
        //                 </Stack>
        //             </Stack>
        //         </CardSection>
        //     ) : (
        //         <Group w={200} h={100} justify="center" align="center">
        //             <Loader />
        //         </Group>
        //     )}
        // </Card>
    );
};

export default Controls;
