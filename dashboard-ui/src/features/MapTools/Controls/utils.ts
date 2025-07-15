import { LayerId, ReservoirConfigs } from '@/features/Map/consts';
import { RasterBaseLayers } from '@/features/Map/types';
import { getReservoirIconImageExpression } from '@/features/Map/utils';
import { Map } from 'mapbox-gl';

export const updateBaseLayer = (baseLayer: RasterBaseLayers, map: Map) => {
    const visibilityMap: {
        [key in RasterBaseLayers]: {
            [key in LayerId]?: 'visible' | 'none';
        };
    } = {
        [RasterBaseLayers.Drought]: {
            [LayerId.USDroughtMonitor]: 'visible',
            [LayerId.NOAAPrecipSixToTen]: 'none',
            [LayerId.NOAATempSixToTen]: 'none',
        },
        [RasterBaseLayers.Precipitation]: {
            [LayerId.USDroughtMonitor]: 'none',
            [LayerId.NOAAPrecipSixToTen]: 'visible',
            [LayerId.NOAATempSixToTen]: 'none',
        },
        [RasterBaseLayers.Temperature]: {
            [LayerId.USDroughtMonitor]: 'none',
            [LayerId.NOAAPrecipSixToTen]: 'none',
            [LayerId.NOAATempSixToTen]: 'visible',
        },
        [RasterBaseLayers.None]: {
            [LayerId.USDroughtMonitor]: 'none',
            [LayerId.NOAAPrecipSixToTen]: 'none',
            [LayerId.NOAATempSixToTen]: 'none',
        },
    };

    const selectedVisibility = visibilityMap[baseLayer];

    Object.entries(selectedVisibility).forEach(([layerId, visibility]) => {
        map.setLayoutProperty(layerId, 'visibility', visibility);
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
                [LayerId.RiseEDRReservoirs].includes(layerId as LayerId)
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

    map.setLayoutProperty(LayerId.Snotel, 'visibility', visibility);
};
