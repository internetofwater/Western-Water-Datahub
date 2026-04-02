/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    ELevel,
    TCoordinateMap,
    TDimension,
    TImages,
    TPosition,
    TSize,
    TSprite,
} from './sprite.types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isDimension(value: unknown): value is TDimension {
    return isRecord(value) && isNumber(value.width) && isNumber(value.height);
}

function isPosition(value: unknown): value is TPosition {
    return (
        isRecord(value) &&
        isNumber(value.width) &&
        isNumber(value.height) &&
        isNumber(value.x) &&
        isNumber(value.y)
    );
}

function isImages(value: unknown): value is TImages {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value[ELevel.One] === 'string' &&
        (!value[ELevel.Two] || typeof value[ELevel.Two] === 'string') &&
        (!value[ELevel.Four] || typeof value[ELevel.Four] === 'string')
    );
}

function isSize(value: unknown): value is TSize {
    if (!isRecord(value)) {
        return false;
    }

    return (
        isDimension(value[ELevel.One]) &&
        (!value[ELevel.Two] || isDimension(value[ELevel.Two])) &&
        (!value[ELevel.Four] || isDimension(value[ELevel.Four]))
    );
}

function isSprites(value: unknown): value is TSprite {
    if (!isRecord(value)) {
        return false;
    }

    return Object.values(value).every(isPosition);
}

export function isCoordinateMap(value: unknown): value is TCoordinateMap {
    if (!isRecord(value)) {
        return false;
    }

    return (
        isImages(value.images) && isSize(value.size) && isSprites(value.sprites)
    );
}

export const loadImageFile = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Canvas failed to load'));
    });
};
