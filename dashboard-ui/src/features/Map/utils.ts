/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { GeoJSONSource, Map } from 'mapbox-gl';
import {
    ComplexReservoirProperties,
    ReservoirPropertiesRaw,
    ReservoirProperties,
    SourceDataEvent,
} from '@/features/Map/types';
import { Feature, FeatureCollection, Point } from 'geojson';
import * as turf from '@turf/turf';
import { LayerId, SourceId } from './config';

/**
 *
 * @function
 */
export const loadTeacups = (map: Map) => {
    const teacupLevels = [
        100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15,
        10, 5, 0,
    ];

    if (!map.hasImage('default')) {
        map.loadImage('/map-icons/default.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: default.png');
            }
            map.addImage('default', image);
        });
    }

    teacupLevels.forEach((level) => {
        const id = `teacup-${level}`;
        if (!map.hasImage(id)) {
            map.loadImage(`/map-icons/${id}.png`, (error, image) => {
                if (error) throw error;
                if (!image) {
                    throw new Error(`Image not found: ${id}.png`);
                }
                map.addImage(id, image);
            });
        }
    });
};

/**
 *
 * @function
 */
export const parseReservoirProperties = <
    T extends keyof ReservoirPropertiesRaw
>(
    key: T,
    value: string | number
): ReservoirProperties[T] => {
    if (ComplexReservoirProperties.includes(key)) {
        return JSON.parse(value as string) as ReservoirProperties[T];
    }
    return value as ReservoirProperties[T];
};

const calculateSpiderfiedPositions = (count: number): [number, number][] => {
    const legLengthStart = 100; // Initial leg length of the spiral
    const legLengthFactor = 100; // Factor for increasing the leg length
    const leavesSeparation = 200; // Separation between points
    const leavesOffset = [0, 0]; // Base offset
    const points: [number, number][] = []; // Array to store positions
    let legLength = legLengthStart; // Current leg length
    let angle = 0; // Initial angle

    for (let i = 0; i < count; i += 1) {
        angle += leavesSeparation / legLength + i * 0.0005; // Increment the angle
        const x = legLength * Math.cos(angle) + leavesOffset[0]; // X-coordinate of the point
        const y = legLength * Math.sin(angle) + leavesOffset[1]; // Y-coordinate of the point
        points.push([x, y]); // Add the point to the array

        legLength += (Math.PI * 2 * legLengthFactor) / angle; // Increase the leg length
    }

    return points;
};

type ReservoirPropertiesWithOffset = ReservoirProperties & {
    offset: [number, number];
};

export const assignOffsetProperty = (
    features: Feature<Point, ReservoirProperties>[]
): FeatureCollection<Point, ReservoirPropertiesWithOffset> => {
    const capacityBuckets = [
        { capacity: 3300, proximity: 0, radius: 0 },
        { capacity: 7000, proximity: 0, radius: 0 },
        { capacity: 13000, proximity: 0, radius: 0 },
        { capacity: 25000, proximity: 0, radius: 0 },
        { capacity: 30000, proximity: 0, radius: 0 },
        { capacity: 45000, proximity: 0, radius: 0 },
        { capacity: 65000, proximity: 0, radius: 0 },
        { capacity: 90000, proximity: 0, radius: 0 },
        { capacity: 145000, proximity: 0, radius: 0 },
        { capacity: 190000, proximity: 0, radius: 0 },
        { capacity: 250000, proximity: 0, radius: 0 },
        { capacity: 320000, proximity: 0, radius: 0 },
        { capacity: 465000, proximity: 0, radius: 0 },
        { capacity: 745000, proximity: 600, radius: 40 },
        { capacity: 985000, proximity: 750, radius: 50 },
        { capacity: 2010000, proximity: 1000, radius: 120 },
    ];

    const getBucketIndex = (value: number) => {
        for (let i = 0; i < capacityBuckets.length; i++) {
            if (value <= capacityBuckets[i].capacity) return i;
        }
        return capacityBuckets.length - 1;
    };

    const _features = features.map<
        Feature<Point, ReservoirPropertiesWithOffset>
    >((feature, index) => {
        const activeCapacity = feature.properties['Active Capacity'] ?? 0;
        const bucketIndex = getBucketIndex(activeCapacity);
        const { proximity, radius } = capacityBuckets[bucketIndex];

        const point = turf.point(feature.geometry.coordinates);
        let offsetX = 0;
        let offsetY = 0;

        const nearby = features.filter((other, otherIndex) => {
            // if (index === otherIndex) return false;

            const otherCapacity = other.properties['Active Capacity'] ?? 0;
            const otherBucketIndex = getBucketIndex(otherCapacity);

            if (otherBucketIndex < bucketIndex) return false;

            const otherPoint = turf.point(other.geometry.coordinates);
            const distance = turf.distance(point, otherPoint, {
                units: 'kilometers',
            });
            return distance < proximity;
        });

        nearby.sort((a, b) => a.properties._id - b.properties._id);
        if (nearby.length > 1 && radius > 0) {
            const nearbyIndex = nearby.findIndex(
                (f) => f.properties._id === feature.properties._id
            );
            if (
                feature.properties._id === 3203 ||
                feature.properties._id === 471
            ) {
                console.log('here', nearby, feature, nearbyIndex);
            }
            const angle =
                (nearbyIndex >= 0 ? nearbyIndex : index % 8) *
                ((2 * Math.PI) / nearby.length);
            offsetX = Math.round(Math.cos(angle) * radius);
            // offsetY = Math.round(Math.sin(angle) * radius);
        }

        return turf.point<ReservoirPropertiesWithOffset>(
            feature.geometry.coordinates,
            {
                ...feature.properties,
                offset: [offsetX, offsetY],
            }
        );
    });

    return turf.featureCollection<Point, ReservoirPropertiesWithOffset>(
        _features
    );
};
// export const assignBarProperty = (
//     features: Feature<Point, ReservoirProperties>[]
// ): FeatureCollection<Point, ReservoirPropertiesWithOffset> => {
//     const capacityBuckets = [
//         { capacity: 3300, proximity: 0, radius: 0 },
//         { capacity: 7000, proximity: 0, radius: 0 },
//         { capacity: 13000, proximity: 0, radius: 0 },
//         { capacity: 25000, proximity: 0, radius: 0 },
//         { capacity: 30000, proximity: 0, radius: 0 },
//         { capacity: 45000, proximity: 0, radius: 0 },
//         { capacity: 65000, proximity: 0, radius: 0 },
//         { capacity: 90000, proximity: 0, radius: 0 },
//         { capacity: 145000, proximity: 0, radius: 0 },
//         { capacity: 190000, proximity: 0, radius: 0 },
//         { capacity: 250000, proximity: 0, radius: 0 },
//         { capacity: 320000, proximity: 0, radius: 0 },
//         { capacity: 465000, proximity: 0, radius: 0 },
//         { capacity: 745000, proximity: 600, radius: 40 },
//         { capacity: 985000, proximity: 750, radius: 50 },
//         { capacity: 2010000, proximity: 1000, radius: 60 },
//     ];

//     const getBucketIndex = (value: number) => {
//         for (let i = 0; i < capacityBuckets.length; i++) {
//             if (value <= capacityBuckets[i].capacity) return i;
//         }
//         return capacityBuckets.length - 1;
//     };

//     const _features = features.map<
//         Feature<Point, ReservoirPropertiesWithOffset>
//     >((feature, index) => {
//         const activeCapacity = feature.properties['Active Capacity'] ?? 0;
//         const bucketIndex = getBucketIndex(activeCapacity);
//         const { proximity, radius } = capacityBuckets[bucketIndex];

//         const point = turf.point(feature.geometry.coordinates);
//         let offsetX = 0;
//         let offsetY = 0;

//         const nearby = features.filter((other, otherIndex) => {
//             if (index === otherIndex) return false;

//             const otherCapacity = other.properties['Active Capacity'] ?? 0;
//             const otherBucketIndex = getBucketIndex(otherCapacity);

//             if (otherBucketIndex < bucketIndex) return false;

//             const otherPoint = turf.point(other.geometry.coordinates);
//             const distance = turf.distance(point, otherPoint, {
//                 units: 'kilometers',
//             });
//             return distance < proximity;
//         });

//         if (nearby.length > 0 && radius > 0) {
//             const nearbyIndex = nearby.findIndex(
//                 (f) => f.properties._id === feature.properties._id
//             );
//             if (
//                 feature.properties._id === 3203 ||
//                 feature.properties._id === 471 ||
//                 nearby.some(
//                     (_feature) =>
//                         _feature.properties._id === 3203 ||
//                         _feature.properties._id === 471
//                 )
//             ) {
//                 console.log('here', nearby, feature, nearbyIndex);
//             }
//             const angle =
//                 (nearbyIndex >= 0 ? nearbyIndex : index % 8) *
//                 ((2 * Math.PI) / nearby.length);
//             offsetX = Math.round(Math.cos(angle) * radius);
//             // offsetY = Math.round(Math.sin(angle) * radius);
//         }

//         return turf.point<ReservoirPropertiesWithOffset>(
//             feature.geometry.coordinates,
//             {
//                 ...feature.properties,
//                 offset: [offsetX, offsetY],
//             }
//         );
//     });

//     return turf.featureCollection<Point, ReservoirPropertiesWithOffset>(
//         _features
//     );
// };

// export const assignBarProperty = (
//     features: Feature<Point, ReservoirProperties>[]
// ): FeatureCollection<Point, ReservoirPropertiesWithOffset> => {
//     const groupedPoints = features.reduce((acc, feature) => {
//         const coordinates = feature.geometry.coordinates;
//         // Reduce precision to aggregate points that are roughly colocated
//         const key = `${coordinates[0].toFixed(2)},${coordinates[1].toFixed(2)}`;
//         if (!acc[key]) {
//             acc[key] = [];
//         }
//         acc[key].push(feature);
//         return acc;
//     }, {} as Record<string, Feature<Point, ReservoirProperties>[]>);

//     const summarizedPoints = Object.keys(groupedPoints).flatMap<
//         Feature<Point, ReservoirPropertiesWithOffset>
//     >((key) => {
//         const points = groupedPoints[key];
//         // const siteNamesSet = new Set<string>();

//         const offsets = calculateSpiderfiedPositions(points.length);

//         return points.map<Feature<Point, ReservoirPropertiesWithOffset>>(
//             (point, index) =>
//                 turf.point<ReservoirPropertiesWithOffset>(
//                     point.geometry.coordinates,
//                     {
//                         ...point.properties,
//                         offset: offsets[index],
//                     }
//                 )
//         );
//     });

//     return turf.featureCollection<
//         Point,
//         ReservoirProperties & { offset: [number, number] }
//     >(summarizedPoints);
// };

export const createReservoirOffsets = (map: Map) => {
    const source = map.getSource(SourceId.Reservoirs) as GeoJSONSource;
    if (source) {
        const features = map.querySourceFeatures(SourceId.Reservoirs, {
            sourceLayer: SourceId.Reservoirs,
        }) as unknown as Feature<Point, ReservoirProperties>[];

        const ids = features.map((o) => o.id);
        const filtered = features.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
        );

        console.log('features', features);
        const updatedFeatureCollection = assignOffsetProperty(filtered);
        console.log('Adjusted', updatedFeatureCollection);

        console.log(
            updatedFeatureCollection.features.filter(
                (feature) =>
                    feature.properties._id === 3203 ||
                    feature.properties._id === 471
            )
        );
        source.setData(updatedFeatureCollection);
    }
};

/**

 * @function
 */
export const isSourceDataLoaded = (
    map: Map,
    sourceId: SourceId,
    event: SourceDataEvent
): boolean => {
    return Boolean(
        event.sourceId === sourceId &&
            map.getSource(sourceId) &&
            map.isSourceLoaded(sourceId) &&
            map.querySourceFeatures(sourceId).length
    );
};
