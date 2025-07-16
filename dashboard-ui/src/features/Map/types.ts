/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { MapSourceDataEvent, Map } from 'mapbox-gl';
import { LayerId, SourceId, SubLayerId } from '@/features/Map/consts';

/**

 * @type
 */
export type SourceDataEvent = {
    type: 'sourcedata';
    target: Map;
} & MapSourceDataEvent;

/**
 *
 * @type
 */
export type ReservoirConfig = {
    id: SourceId;
    storageProperty: string;
    capacityProperty: string;
    identifierProperty: string;
    identifierType: 'string' | 'number';
    labelProperty: string;
    regionConnectorProperty: string;
    connectedLayers: (LayerId | SubLayerId)[];
};

export enum RasterBaseLayers {
    Drought = LayerId.USDroughtMonitor,
    Precipitation = LayerId.NOAAPrecipSixToTen,
    Temperature = LayerId.NOAATempSixToTen,
    None = 'none',
}
