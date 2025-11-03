// Center point of each huc boundary for drawing labels
// Some adjustments for better position
import { FeatureCollection, Point } from 'geojson';

export const huc02Centers: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                id: 1,
                name: 'New England Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-70.025842537, 44.432876329],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 2,
                name: 'Mid Atlantic Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-76.64636500808136, 40.84141988456247],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 3,
                name: 'South Atlantic-Gulf Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-84.00641573835105, 33.3596708184683],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 4,
                name: 'Great Lakes Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-83.670986631, 45.274667402],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 5,
                name: 'Ohio Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-83.858233346, 38.868693634],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 6,
                name: 'Tennessee Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-85.180811354, 35.592508032],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 7,
                name: 'Upper Mississippi Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-91.719515314, 42.83426983],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 8,
                name: 'Lower Mississippi Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-91.53734907020255, 33.54103624020799],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 9,
                name: 'Souris-Red-Rainy Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.42064729352984, 49.226235790304884],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 9,
                name: 'Souris-Red-Rainy Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-114.13930954636578, 49.99332854905629],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 10,
                name: 'Missouri Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-102.861312507, 43.744301875],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 11,
                name: 'Arkansas-White-Red Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-98.437540298, 36.094387703],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 12,
                name: 'Texas-Gulf Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-97.80995183001559, 31.586608173572984],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 13,
                name: 'Rio Grande Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-104.221449787, 30.865801709],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 14,
                name: 'Upper Colorado Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-109.022990163, 39.165107464],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 15,
                name: 'Lower Colorado Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-111.914388969, 33.995973016],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 16,
                name: 'Great Basin Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-115.717018816, 40.374248643],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 17,
                name: 'Pacific Northwest Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-118.058405599, 46.028693029],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 18,
                name: 'California Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-119.772122181, 37.427876934],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 19,
                name: 'Alaska Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-150.511130716, 63.757185864],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 20,
                name: 'Hawaii Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-156.58913094, 20.427874336],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 21,
                name: 'Caribbean Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [-66.235535985, 18.194997215],
            },
        },
        {
            type: 'Feature',
            properties: {
                id: 22,
                name: 'South Pacific Region',
            },
            geometry: {
                type: 'Point',
                coordinates: [24.954304164, 3.209606223],
            },
        },
    ],
};
