/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Map } from 'mapbox-gl';
import { positions } from './report.service';

export type IdentifiableProperties = {
    configId: ReservoirConfig['id'];
} & Record<string, string | number>;

export const getClosestPoints = <V extends GeoJsonProperties>(
    center: [number, number],
    features: Feature<Point, V>[]
): Feature<Point, V>[] => {
    const centerPoint = turf.point(center);

    // Calculate distances and sort
    const sortedByDistance = features
        .map((feature) => {
            const distance = turf.distance(
                centerPoint,
                turf.point(feature.geometry.coordinates),
                { units: 'kilometers' }
            );
            return { feature, distance };
        })
        .sort((a, b) => a.distance - b.distance);

    // Get the closest N points
    const closestPoints = sortedByDistance
        .slice(0, 10)
        .map((item) => item.feature);

    return closestPoints;
};

export const getClosestPointsForConfig = (
    map: Map,
    config: ReservoirConfig
): Feature<Point, IdentifiableProperties>[] => {
    const center = map.getCenter();

    const _features = map.querySourceFeatures(config.id) as Feature<
        Point,
        GeoJsonProperties
    >[];

    const features = _features.map((feature) => ({
        ...feature,
        geometry: feature.geometry,
        properties: {
            ...feature.properties,
            configId: config.id,
        },
    }));

    return getClosestPoints([center.lng, center.lat], features);
};

export const getHighestCapacityReservoirs = (
    map: Map,
    config: ReservoirConfig
): Feature<Point, IdentifiableProperties>[] => {
    const _features = map.queryRenderedFeatures({
        layers: [config.connectedLayers[0]],
    }) as Feature<Point, GeoJsonProperties>[];

    const features = _features.map((feature) => ({
        ...feature,
        geometry: feature.geometry,
        properties: {
            ...feature.properties,
            configId: config.id,
        },
    }));

    const sortedFeatures = sortFeaturesByValue(
        features,
        config.capacityProperty
    ).slice(0, positions.length);

    return sortedFeatures;
};

export const sortFeaturesByValue = <T extends Record<string, string | number>>(
    features: Feature<Point, T>[],
    property: string
): Feature<Point, T>[] => {
    const sortedFeatures = features.sort((a, b) => {
        const aVal = Number(a.properties?.[property] ?? 0);
        const bVal = Number(b.properties?.[property] ?? 0);
        return bVal - aVal; // Descending order
    });

    return sortedFeatures;
};
