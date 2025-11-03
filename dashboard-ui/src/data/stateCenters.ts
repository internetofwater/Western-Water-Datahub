import { FeatureCollection, Point } from 'geojson';

export const stateCenters: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                name: 'Washington',
                stusps: 'WA',
            },
            geometry: {
                type: 'Point',
                coordinates: [-120.7401, 47.7511],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Oregon',
                stusps: 'OR',
            },
            geometry: {
                type: 'Point',
                coordinates: [-120.5411, 44.1189],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'California',
                stusps: 'CA',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.4179, 36.7783],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Idaho',
                stusps: 'ID',
            },
            geometry: {
                type: 'Point',
                coordinates: [-114.742, 44.0682],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Nevada',
                stusps: 'NV',
            },
            geometry: {
                type: 'Point',
                coordinates: [-117.284, 40.2764],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Montana',
                stusps: 'MT',
            },
            geometry: {
                type: 'Point',
                coordinates: [-109.6338, 47.1275],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Wyoming',
                stusps: 'WY',
            },
            geometry: {
                type: 'Point',
                coordinates: [-107.2903, 43.0759],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'Utah',
                stusps: 'UT',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.9569, 39.9702],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Arizona',
                stusps: 'AZ',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.0937, 34.0489],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Colorado',
                stusps: 'CO',
            },
            geometry: {
                type: 'Point',
                coordinates: [-105.7821, 39.5501],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'New Mexico',
                stusps: 'NM',
            },
            geometry: {
                type: 'Point',
                coordinates: [-105.8701, 34.5199],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'North Dakota',
                stusps: 'ND',
            },
            geometry: {
                type: 'Point',
                coordinates: [-100.3848, 47.6329],
            },
        },

        {
            type: 'Feature',
            properties: {
                name: 'South Dakota',
                stusps: 'SD',
            },
            geometry: {
                type: 'Point',
                coordinates: [-100.3848, 44.7389],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Nebraska',
                stusps: 'NE',
            },
            geometry: {
                type: 'Point',
                coordinates: [-99.9018, 41.4925],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Oklahoma',
                stusps: 'OK',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.0929, 35.4676],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Kansas',
                stusps: 'KS',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.4833, 38.7246],
            },
        },
        {
            type: 'Feature',
            properties: {
                name: 'Texas',
                stusps: 'TX',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.4274, 31.7337],
            },
        },
    ],
};
