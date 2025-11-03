import { FeatureCollection, Point } from 'geojson';

export const regionCenters: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                REG_NUM: 5,
                name: 'Missouri Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-101.0817, 46.9738],
            },
        },
        {
            type: 'Feature',
            properties: {
                REG_NUM: 6,
                name: 'Arkansas - Rio Grande - Texas Gulf',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.8068, 32.4998],
            },
        },
        {
            type: 'Feature',
            properties: {
                REG_NUM: 7,
                name: 'Upper Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-108.1286, 39.6615],
            },
        },
        {
            type: 'Feature',
            properties: {
                REG_NUM: 8,
                name: 'Lower Colorado Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-113.5361, 34.6394],
            },
        },
        {
            type: 'Feature',
            properties: {
                REG_NUM: 9,
                name: 'Columbia - Pacific Northwest',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.702, 45.8915],
            },
        },
        {
            type: 'Feature',
            properties: {
                REG_NUM: 10,
                name: 'California - Great Basin',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.1046, 39.2372],
            },
        },
    ],
};
