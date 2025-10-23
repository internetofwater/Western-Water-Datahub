/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, ReservoirConfigs, SubLayerId } from '@/features/Map/consts';
import { RasterBaseLayers } from '@/features/Map/types';
import { getReservoirIconImageExpression } from '@/features/Map/utils';
import { Map } from 'mapbox-gl';

export const RasterVisibilityMap: {
    [key in RasterBaseLayers]: {
        [key in LayerId]?: boolean;
    };
} = {
    [RasterBaseLayers.Drought]: {
        [LayerId.USDroughtMonitor]: true,
        [LayerId.NOAAPrecipSixToTen]: false,
        [LayerId.NOAATempSixToTen]: false,
    },
    [RasterBaseLayers.Precipitation]: {
        [LayerId.USDroughtMonitor]: false,
        [LayerId.NOAAPrecipSixToTen]: true,
        [LayerId.NOAATempSixToTen]: false,
    },
    [RasterBaseLayers.Temperature]: {
        [LayerId.USDroughtMonitor]: false,
        [LayerId.NOAAPrecipSixToTen]: false,
        [LayerId.NOAATempSixToTen]: true,
    },
    [RasterBaseLayers.None]: {
        [LayerId.USDroughtMonitor]: false,
        [LayerId.NOAAPrecipSixToTen]: false,
        [LayerId.NOAATempSixToTen]: false,
    },
};

export const updateBaseLayer = (baseLayer: RasterBaseLayers, map: Map) => {
    const selectedVisibility = RasterVisibilityMap[baseLayer];

    Object.entries(selectedVisibility).forEach(([layerId, visibility]) => {
        map.setLayoutProperty(
            layerId,
            'visibility',
            visibility ? 'visible' : 'none'
        );
    });
};

export const updateBaseLayerOpacity = (baseLayerOpacity: number, map: Map) => {
    map.setPaintProperty(
        LayerId.USDroughtMonitor,
        'raster-opacity',
        baseLayerOpacity
    );
    map.setPaintProperty(
        LayerId.NOAAPrecipSixToTen,
        'raster-opacity',
        baseLayerOpacity
    );
    map.setPaintProperty(
        LayerId.NOAATempSixToTen,
        'raster-opacity',
        baseLayerOpacity
    );
};

export const updateTeacups = (showTeacups: boolean, map: Map) => {
    ReservoirConfigs.forEach((config) =>
        config.connectedLayers
            .filter((layerId) =>
                [
                    LayerId.RiseEDRReservoirs,
                    LayerId.ResvizEDRReservoirs,
                ].includes(layerId as LayerId)
            )
            .forEach((layerId) =>
                map.setLayoutProperty(
                    layerId,
                    'icon-image',
                    showTeacups
                        ? getReservoirIconImageExpression(config)
                        : 'default'
                )
            )
    );
};

export const updateNOAARFC = (showNOAARFC: boolean, map: Map) => {
    const visibility = showNOAARFC ? 'visible' : 'none';

    map.setLayoutProperty(LayerId.NOAARiverForecast, 'visibility', visibility);
};

export const updateSnotel = (showSnotel: boolean, map: Map) => {
    const visibility = showSnotel ? 'visible' : 'none';

    map.setLayoutProperty(SubLayerId.SnotelBoundary, 'visibility', visibility);
    map.setLayoutProperty(SubLayerId.SnotelFill, 'visibility', visibility);
};
