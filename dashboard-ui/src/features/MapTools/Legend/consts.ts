/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId } from '@/features/Map/consts';
import { TEntry } from '@/features/MapTools/Legend/types';
import { LayerType } from '@/components/Map/types';

export const entries: TEntry[] = [
    {
        id: LayerId.SnotelHucSixMeans,
        type: LayerType.Fill,
        items: [
            {
                color: '#ea3e3e',
                label: '<50',
            },
            {
                color: '#eab03e',
                label: '50-70',
            },
            {
                color: '#eaea3e',
                label: '70-90',
            },
            {
                color: '#77ea3e',
                label: '90-110',
            },
            {
                color: '#94fde5',
                label: '110-130',
            },
            {
                color: '#3ebdea',
                label: '130-150',
            },
            {
                color: '#3e3efd',
                label: '>150',
            },
        ],
    },
    {
        id: LayerId.NOAARiverForecast,
        type: LayerType.Circle,
        items: [
            {
                color: '#fff',
                label: 'No Data',
            },
            {
                color: '#a30000',
                label: '<25',
            },
            {
                color: '#fb0000',
                label: '25-50',
            },
            {
                color: '#fd9400',
                label: '50-75',
            },
            {
                color: '#e8ec08',
                label: '75-90',
            },
            {
                color: '#20ee00',
                label: '90-100',
            },
            {
                color: '#1eeae8',
                label: '100-125',
            },
            {
                color: '#1084e7',
                label: '125-150',
            },
            {
                color: '#0000fe',
                label: '>150',
            },
        ],
    },
    {
        id: LayerId.USDroughtMonitor,
        type: LayerType.Raster,
        direction: 'horizontal',
        groups: [
            {
                direction: 'vertical',
                type: LayerType.Fill,
                items: [
                    {
                        color: '#fefe00',
                        label: 'Abnormally Dry',
                    },
                    {
                        color: '#fed27e',
                        label: 'Drought - Moderate',
                    },
                    {
                        color: '#fea900',
                        label: 'Drought - Severe',
                    },
                    {
                        color: '#e50000',
                        label: 'Drought - Extreme',
                    },
                    {
                        color: '#730000',
                        label: 'Drought - Exceptional',
                    },
                ],
            },
        ],
    },
    {
        id: LayerId.NOAAPrecipSixToTen,
        type: LayerType.Raster,
        direction: 'horizontal',
        groups: [
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Above Normal',
                items: [
                    {
                        color: '#B3D9AB',
                        label: '33-40%',
                    },
                    {
                        color: '#95CE7F',
                        label: '40-50%',
                    },
                    {
                        color: '#48B430',
                        label: '50-60%',
                    },
                    {
                        color: '#009620',
                        label: '60-70%',
                    },
                    {
                        color: '#007814',
                        label: '70-80%',
                    },
                    {
                        color: '#28600A',
                        label: '80-90%',
                    },
                    {
                        color: '#285300',
                        label: '90-100%',
                    },
                ],
            },
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Below Normal',
                items: [
                    {
                        color: '#F0D493',
                        label: '33-40%',
                    },
                    {
                        color: '#D8A74F',
                        label: '40-50%',
                    },
                    {
                        color: '#BB6D33',
                        label: '50-60%',
                    },
                    {
                        color: '#9B5031',
                        label: '60-70%',
                    },
                    {
                        color: '#934639',
                        label: '70-80%',
                    },
                    {
                        color: '#804000',
                        label: '80-90%',
                    },
                    {
                        color: '#4F2F2F',
                        label: '90-100%',
                    },
                ],
            },
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Near Normal',
                items: [
                    {
                        color: '#A0A0A0',
                        label: '',
                    },
                ],
            },
        ],
    },
    {
        id: LayerId.NOAATempSixToTen,
        type: LayerType.Raster,
        direction: 'horizontal',
        groups: [
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Above Normal',
                items: [
                    {
                        color: '#E7B168',
                        label: '33-40%',
                    },
                    {
                        color: '#E38B4B',
                        label: '40-50%',
                    },
                    {
                        color: '#DA5731',
                        label: '50-60%',
                    },
                    {
                        color: '#C93B1A',
                        label: '60-70%',
                    },
                    {
                        color: '#B32E05',
                        label: '70-80%',
                    },
                    {
                        color: '#912600',
                        label: '80-90%',
                    },
                    {
                        color: '#702100',
                        label: '90-100%',
                    },
                ],
            },
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Below Normal',
                items: [
                    {
                        color: '#BFCBE4',
                        label: '33-40%',
                    },
                    {
                        color: '#A0C0DF',
                        label: '40-50%',
                    },
                    {
                        color: '#77B5E2',
                        label: '50-60%',
                    },
                    {
                        color: '#389FDC',
                        label: '60-70%',
                    },
                    {
                        color: '#005DA1',
                        label: '70-80%',
                    },
                    {
                        color: '#2E216F',
                        label: '80-90%',
                    },
                    {
                        color: '#221852',
                        label: '90-100%',
                    },
                ],
            },
            {
                direction: 'vertical',
                type: LayerType.Fill,
                label: 'Near Normal',
                items: [
                    {
                        color: '#A0A0A0',
                        label: '',
                    },
                ],
            },
        ],
    },
];
