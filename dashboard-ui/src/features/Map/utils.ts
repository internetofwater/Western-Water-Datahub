/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Map } from 'mapbox-gl';
import {
    ComplexReservoirProperties,
    ReservoirPropertiesRaw,
    ReservoirProperties,
} from '@/features/Map/types';

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
