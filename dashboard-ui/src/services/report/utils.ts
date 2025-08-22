import { ReservoirConfig } from '@/features/Map/types';
import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Map } from 'mapbox-gl';

export type IdentifiableProperties = {
    configId: ReservoirConfig['id'];
} & Record<string, string | number>;

export const getClosestPoints = <V extends GeoJsonProperties>(
    center: [number, number],
    features: Feature<Point, V>[]
): Feature<Point, V>[] => {
    const centerPoint = turf.point(center);

    console.log('features', features);

    // // Calculate distances and sort
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

    console.log('closestPoints', closestPoints);

    return closestPoints;
};

export const getClosestPointsForConfig = (
    map: Map,
    config: ReservoirConfig
): Feature<Point, IdentifiableProperties>[] => {
    // Your target location
    const center = map.getCenter(); // e.g., [-122.45, 45.21]

    // Get all features from a source (assuming it's a GeoJSON source)
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
    ).slice(0, 15);

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

export const sortFeaturesInCircle = <T extends Record<string, string | number>>(
    features: Feature<Point, T>[],
    map: mapboxgl.Map
): Feature<Point, T>[] => {
    const cx =
        features.reduce(
            (sum, f) =>
                sum + map.project(f.geometry.coordinates as [number, number]).x,
            0
        ) / features.length;
    const cy =
        features.reduce(
            (sum, f) =>
                sum + map.project(f.geometry.coordinates as [number, number]).y,
            0
        ) / features.length;

    return features.sort((a, b) => {
        const pa = map.project(a.geometry.coordinates as [number, number]);
        const pb = map.project(b.geometry.coordinates as [number, number]);

        const angleA = Math.atan2(pa.y - cy, pa.x - cx);
        const angleB = Math.atan2(pb.y - cy, pb.x - cx);

        return angleA - angleB;
    });
};
