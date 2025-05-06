/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { SourceId } from '@/features/Map/config';
import { ComboboxData, ComboboxItem } from '@mantine/core';
import { ExpressionSpecification, Map as MapObj } from 'mapbox-gl';

/**

 * @function
 */
export const createOptions = (
    map: MapObj,
    sourceId: SourceId,
    property: string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
    });

    const options = new Map<string, ComboboxItem>();
    options.set('all', { value: 'all', label: defaultLabel });
    features.forEach((feature) => {
        if (feature.properties) {
            const value = feature.properties[property] as string;

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: value,
                });
            }
        }
    });
    return Array.from(options.values());
};

/**

 * @function
 */
export const createFilteredOptions = (
    map: MapObj,
    sourceId: SourceId,
    filter: ExpressionSpecification,
    property: string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
        filter: filter,
    });

    const options = new Map<string, ComboboxItem>();
    options.set('all', { value: 'all', label: defaultLabel });
    features.forEach((feature) => {
        if (feature.properties) {
            const value = feature.properties[property] as string;

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: value,
                });
            }
        }
    });

    return Array.from(options.values());
};
