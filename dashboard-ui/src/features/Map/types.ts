/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { MapSourceDataEvent, Map } from 'mapbox-gl';
import { LayerId, SourceId, SubLayerId } from '@/features/Map/consts';
import { IGetLocationParams } from '@/services/edr.service';

/**

 * @type
 */
export type SourceDataEvent = {
    type: 'sourcedata';
    target: Map;
} & MapSourceDataEvent;

export type ReservoirConfigId = SourceId.TeacupEDRReservoirs;

/**
 *
 * @type
 */
export type ReservoirConfigProperties = {
    source: SourceId;
    storageProperty: string;
    capacityProperty: string;
    tenthPercentileProperty: string;
    ninetiethPercentileProperty: string;
    thirtyYearAverageProperty: string;
    storageDateProperty: string;
    identifierProperty: string;
    identifierType: 'string' | 'number';
    shortLabelProperty: string;
    longLabelProperty: string;
    chartLabel: string;
    regionConnectorProperty: string;
    managingRegionConnectorProperty: string;
    basinConnectorProperty: string;
    stateConnectorProperty: string;
    iconLayer: LayerId | SubLayerId;
    labelLayer: LayerId | SubLayerId;
    params?: IGetLocationParams;
};

export enum RasterBaseLayers {
    Drought = LayerId.USDroughtMonitor,
    Precipitation = LayerId.NOAAPrecipSixToTen,
    Temperature = LayerId.NOAATempSixToTen,
    None = 'none',
}
