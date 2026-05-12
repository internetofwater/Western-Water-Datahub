/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Map as MapboxMap } from 'mapbox-gl';
import {
    ELevel,
    TCoordinateMap,
    TDimension,
    TImages,
    TPosition,
    TSize,
    TSprite,
} from '@/services/sprite/sprite.types';

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

export const customLoader = (
    map: MapboxMap,
    coordinateMap: TCoordinateMap,
    context: OffscreenCanvasRenderingContext2D
) => {
    const blockingSet = new Set<string>();
    const cache = new Map<string, { row: number; height: number }>();

    const teacupWidth = 160;
    const bufferedTeacupWidth = teacupWidth + 1;

    const teacupHeight = 107;
    const bufferedTeacupHeight = teacupHeight + 1;

    // Determine canvas width and height by number of loops possible
    const width = bufferedTeacupWidth * 22;
    const height = bufferedTeacupHeight * 27;
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

    const overlayCanvas = new OffscreenCanvas(width, height);
    const overlayCtx = overlayCanvas.getContext('2d', {
        willReadFrequently: true,
    });

    if (!tempCtx || !overlayCtx) {
        return;
    }

    let i = 0,
        j = 0;
    map.on('styleimagemissing', (e) => {
        const { id } = e;
        if (!blockingSet.has(id)) {
            blockingSet.add(id);
            if (cache.has(id)) {
                const position = cache.get(id);
                if (position) {
                    const { row, height } = position;

                    const imageData = tempCtx.getImageData(
                        row,
                        height,
                        teacupWidth,
                        teacupHeight
                    );

                    if (imageData && !map.hasImage(id)) {
                        map.addImage(id, imageData);
                    }
                }
            } else {
                // We dont need the prefix
                const [, storage, average] = id.split('-');

                const teacupPosition =
                    coordinateMap.sprites[`teacup-${storage}`];
                const averagePosition =
                    coordinateMap.sprites[`average-line-${average}`];

                if (teacupPosition && averagePosition) {
                    const {
                        x: teacupX,
                        y: teacupY,
                        width: teacupWidth,
                        height: teacupHeight,
                    } = teacupPosition;
                    const teacupImageData = context.getImageData(
                        teacupX,
                        teacupY,
                        teacupWidth,
                        teacupHeight
                    );

                    const {
                        x: averageX,
                        y: averageY,
                        width: averageWidth,
                        height: averageHeight,
                    } = averagePosition;
                    const averageImageData = context.getImageData(
                        averageX,
                        averageY,
                        averageWidth,
                        averageHeight
                    );

                    const row = 160 + bufferedTeacupWidth * i;
                    const height = 107 + bufferedTeacupHeight * j;

                    // At row 20, move to next column
                    if (i === 20) {
                        j += 1;
                        i = 0;
                    } else {
                        i += 1;
                    }

                    tempCtx.putImageData(teacupImageData, row, height);

                    overlayCtx.putImageData(averageImageData, row, height);
                    tempCtx.drawImage(overlayCanvas, 0, 0);

                    const imageData = tempCtx.getImageData(
                        row,
                        height,
                        teacupWidth,
                        teacupHeight
                    );

                    cache.set(id, { row, height });
                    if (!map.hasImage(id)) {
                        map.addImage(id, imageData);
                    }
                }
            }
        }
    });

    map.on('style.load', () => {
        blockingSet.clear();
        for (const [id, position] of cache) {
            const { row, height } = position;

            const imageData = tempCtx.getImageData(
                row,
                height,
                teacupWidth,
                teacupHeight
            );

            if (imageData && !map.hasImage(id)) {
                map.addImage(id, imageData);
            }
        }
    });
};
