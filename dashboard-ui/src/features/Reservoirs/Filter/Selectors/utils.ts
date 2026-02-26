/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { SourceId } from '@/features/Map/consts';
import { ComboboxItem } from '@mantine/core';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { ExpressionSpecification, Map as MapObj } from 'mapbox-gl';

export type ItemWithSource = ComboboxItem & { source?: string };

export const formatOptions = <T extends Geometry, V extends GeoJsonProperties>(
    features: Feature<T, V>[],
    getValueProperty: (feature: Feature<T, V>) => string,
    getLabelProperty: (feature: Feature<T, V>) => string,
    defaultLabel: string = 'All',
    defaultValue: string = 'all',
    noDefault: boolean = false,
    source?: string
): ItemWithSource[] => {
    const options = new Map<string, ItemWithSource>();
    if (!noDefault) {
        options.set('all', { value: defaultValue, label: defaultLabel });
    }
    features.forEach((feature) => {
        if (feature.properties) {
            // Value and label must be a string
            const value = getValueProperty(feature);
            const label = getLabelProperty(feature);

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: label,
                    source,
                });
            }
        }
    });
    return Array.from(options.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
    );
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
): ComboboxItem[] => {
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
): ComboboxItem[] => {
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
