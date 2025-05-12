/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { SourceId } from '@/features/Map/consts';
import { ComboboxData, ComboboxItem } from '@mantine/core';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { ExpressionSpecification, Map as MapObj } from 'mapbox-gl';

export const formatOptions = (
    features: Feature<Geometry, GeoJsonProperties>[],
    getValueProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    getLabelProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    defaultLabel: string = 'All',
    defaultValue: string = 'all'
): ComboboxData => {
    const options = new Map<string, ComboboxItem>();
    options.set('all', { value: defaultValue, label: defaultLabel });
    features.forEach((feature) => {
        if (feature.properties) {
            // Value and label must be a string
            const value = getValueProperty(feature);
            const label = getLabelProperty(feature);

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: label,
                });
            }
        }
    });
    return Array.from(options.values());
};

/**

 * @function
 */
export const createOptionsFromMapboxSource = (
    map: MapObj,
    sourceId: SourceId,
    getValueProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    getLabelProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
    });

    return formatOptions(
        features,
        getValueProperty,
        getLabelProperty,
        defaultLabel
    );
};

/**

 * @function
 */
export const createFilteredOptionsFromMapboxSource = (
    map: MapObj,
    sourceId: SourceId,
    filter: ExpressionSpecification,
    getValueProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    getLabelProperty: (feature: Feature<Geometry, GeoJsonProperties>) => string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
        filter: filter,
    });

    return formatOptions(
        features,
        getValueProperty,
        getLabelProperty,
        defaultLabel
    );
};
