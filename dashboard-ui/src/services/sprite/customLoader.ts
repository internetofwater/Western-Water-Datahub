/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Map as MapboxMap } from 'mapbox-gl';
import { TCoordinateMap, TPosition } from '@/services/sprite/sprite.types';

type TLocation = {
    x: number;
    y: number;
};

const ICON_BUFFER = 1;

const ICON_WIDTH = 160;

const ICON_HEIGHT = 107;

/**
 * Get the position of a previously loaded icon from the cache, extract it from the canvas, and load into map.
 *
 * @param {string} id - Teacup Icon Id, expected format: `teacup-"storage-value"` or `teacup-"storage-value"-"average-value"`
 * @param {number} width - Icon width
 * @param {number} height - Icon height
 * @param {MapboxMap} map - Mapbox GL JS map instance
 * @param {Map<string, TLocation>} cache - Cache that matches an icon id with a position on the offscreen canvas
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context to extract from
 */
const loadFromCache = (
    id: string,
    width: number,
    height: number,
    map: MapboxMap,
    cache: Map<string, TLocation>,
    ctx: OffscreenCanvasRenderingContext2D
) => {
    const position = cache.get(id);
    if (position) {
        const { x, y } = position;

        const imageData = ctx.getImageData(x, y, width, height);

        if (imageData && !map.hasImage(id)) {
            map.addImage(id, imageData);
        }
    }
};

/**
 * Extract icon image data from canvas
 *
 * @param {TPosition} position - Location and dimension of icon to extract
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context to extract from
 * @returns {ImageData}
 */
const getImage = (
    position: TPosition,
    ctx: OffscreenCanvasRenderingContext2D
): ImageData => {
    const { x, y, width, height } = position;
    return ctx.getImageData(x, y, width, height);
};

/**
 * Get the current icon position based on indexes and teacup dimensions
 *
 * @param {number} i
 * @param {number} j
 * @param {number} bufferedWidth
 * @param {number} bufferedHeight
 * @returns {{ x: number; y: number }}
 */
const getLocation = (
    i: number,
    j: number,
    bufferedWidth: number,
    bufferedHeight: number
): { x: number; y: number } => {
    const x = ICON_WIDTH + bufferedWidth * i;
    const y = ICON_HEIGHT + bufferedHeight * j;

    return { x, y };
};

/**
 * Update and return new indexes
 *
 * @param {number} i
 * @param {number} j
 * @returns {{ i: number; j: number }}
 */
const updateIndexes = (i: number, j: number): { i: number; j: number } => {
    let safeI = i,
        safeJ = j;
    // At row 20, move to next column
    if (safeI === 20) {
        safeJ += 1;
        safeI = 0;
    } else {
        safeI += 1;
    }

    return { i: safeI, j: safeJ };
};

/**
 * Extracts an image from the canvas context and loads it into Mapbox GL
 *
 * @param {string} id - Teacup Icon Id, expected format: `teacup-"storage-value"` or `teacup-"storage-value"-"average-value"`
 * @param {number} x - Icon X Position
 * @param {number} y - Icon Y Position
 * @param {number} width - Icon width
 * @param {number} height - Icon height
 * @param {MapboxMap} map - Mapbox GL JS map instance
 * @param {Map<string, TLocation>} cache - Cache that matches an icon id with a position on the offscreen canvas
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context to extract from
 */
const loadImageAndCache = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    map: MapboxMap,
    cache: Map<string, TLocation>,
    ctx: OffscreenCanvasRenderingContext2D
) => {
    const imageData = ctx.getImageData(x, y, width, height);

    cache.set(id, { x, y });
    if (imageData && !map.hasImage(id)) {
        map.addImage(id, imageData);
    }
};

/**
 * Curried function that handles the logic for extracting icons and loading the
 * combined icon into the map. This function handles teacups that have no 30-year average value.
 *
 * @param {number} teacupWidth - Width of a teacup icon
 * @param {number} teacupHeight - Height of a teacup icon
 * @param {MapboxMap} map - Mapbox GL JS map instance
 * @param {TCoordinateMap} coordinateMap - JSON doc that provides the necessary info for
 *  extracting icons from the Spritesheet canvas
 * @param {OffscreenCanvasRenderingContext2D} spritesheetContext - Spritesheet canvas context (will read frequently)
 * @param {Map<string, TLocation>} cache - Cache that matches an icon id with a position on the offscreen canvas
 * @param {OffscreenCanvasRenderingContext2D} mainCtx - Primary canvas context onto which all icons are drawn
 * @returns - A function the reduces the interface to only what changes between calls, the returned function returns
 * updated indexes
 */
const loadTeacupsConstructor =
    (
        teacupWidth: number,
        teacupHeight: number,
        map: MapboxMap,
        cache: Map<string, TLocation>,
        coordinateMap: TCoordinateMap,
        spritesheetContext: OffscreenCanvasRenderingContext2D,
        mainCtx: OffscreenCanvasRenderingContext2D
    ) =>
    (storage: number, i: number, j: number): { i: number; j: number } => {
        let nextI = i,
            nextJ = j;
        const bufferedTeacupWidth = teacupWidth + ICON_BUFFER;
        const bufferedTeacupHeight = teacupHeight + ICON_BUFFER;
        const id = `teacup-${storage}`;
        if (cache.has(id)) {
            loadFromCache(id, teacupWidth, teacupHeight, map, cache, mainCtx);
        } else {
            const teacupPosition = coordinateMap.sprites[`teacup-${storage}`];

            if (teacupPosition) {
                const teacupImageData = getImage(
                    teacupPosition,
                    spritesheetContext
                );

                const { x, y } = getLocation(
                    i,
                    j,
                    bufferedTeacupWidth,
                    bufferedTeacupHeight
                );

                ({ i: nextI, j: nextJ } = updateIndexes(i, j));

                mainCtx.putImageData(teacupImageData, x, y);

                loadImageAndCache(
                    id,
                    x,
                    y,
                    teacupWidth,
                    teacupHeight,
                    map,
                    cache,
                    mainCtx
                );
            }
        }

        return { i: nextI, j: nextJ };
    };

/**
 * Curried function that handles the logic for extracting icons, layering them, and loading the
 * combined icon into the map.
 *
 * @param {number} teacupWidth - width of a teacup icon
 * @param {number} teacupHeight - height of a teacup icon
 * @param {MapboxMap} map - Mapbox GL JS map instance
 * @param {TCoordinateMap} coordinateMap - JSON doc that provides the necessary info for
 *  extracting icons from the Spritesheet canvas
 * @param {OffscreenCanvasRenderingContext2D} spritesheetContext - Spritesheet canvas context (will read frequently)
 * @param {Map<string, TLocation>} cache - Cache that matches an icon id with a position on the offscreen canvas
 * @param {OffscreenCanvas} overlayCanvas - This canvas is used to layer the 30-year average line over the teacup storage icon
 * @param {OffscreenCanvasRenderingContext2D} mainCtx - Primary canvas context onto which all icons are drawn
 * @param {OffscreenCanvasRenderingContext2D} overlayCtx - 30-year average canvas context
 * @returns - A function the reduces the interface to only what changes between calls, the returned function returns
 * updated indexes
 */
const loadTeacupWithAveragesConstructor =
    (
        teacupWidth: number,
        teacupHeight: number,
        map: MapboxMap,
        cache: Map<string, TLocation>,
        overlayCanvas: OffscreenCanvas,
        coordinateMap: TCoordinateMap,
        spritesheetContext: OffscreenCanvasRenderingContext2D,
        mainCtx: OffscreenCanvasRenderingContext2D,
        overlayCtx: OffscreenCanvasRenderingContext2D
    ) =>
    (
        storage: number,
        average: number,
        i: number,
        j: number
    ): { i: number; j: number } => {
        let nextI = i,
            nextJ = j;
        const bufferedTeacupWidth = teacupWidth + ICON_BUFFER;
        const bufferedTeacupHeight = teacupHeight + ICON_BUFFER;

        const id = `teacup-${storage}-${average}`;
        if (cache.has(id)) {
            loadFromCache(id, teacupWidth, teacupHeight, map, cache, mainCtx);
        } else {
            const teacupPosition = coordinateMap.sprites[`teacup-${storage}`];
            const averagePosition =
                coordinateMap.sprites[`average-line-${average}`];

            if (teacupPosition && averagePosition) {
                const teacupImageData = getImage(
                    teacupPosition,
                    spritesheetContext
                );

                const averageImageData = getImage(
                    averagePosition,
                    spritesheetContext
                );

                const { x, y } = getLocation(
                    i,
                    j,
                    bufferedTeacupWidth,
                    bufferedTeacupHeight
                );

                ({ i: nextI, j: nextJ } = updateIndexes(i, j));

                mainCtx.putImageData(teacupImageData, x, y);

                overlayCtx.putImageData(averageImageData, x, y);
                mainCtx.drawImage(overlayCanvas, 0, 0);

                loadImageAndCache(
                    id,
                    x,
                    y,
                    teacupWidth,
                    teacupHeight,
                    map,
                    cache,
                    mainCtx
                );
            }
        }

        return { i: nextI, j: nextJ };
    };

/**
 * Composes icons from an optimized spritesheet. It combines
 * the average line icon over the teacup storage icon to produce a teacup with an
 * average line. It also loads icons to handle instances where a teacup has no
 * average value available.
 *
 * @param {MapboxMap} map - Mapbox GL JS map instance
 * @param {TCoordinateMap} coordinateMap - JSON doc that provides the necessary info for
 *  extracting icons from the Spritesheet canvas
 * @param {OffscreenCanvasRenderingContext2D} spritesheetContext - Spritesheet canvas context (will read frequently)
 */
export const customLoader = (
    map: MapboxMap,
    coordinateMap: TCoordinateMap,
    spritesheetContext: OffscreenCanvasRenderingContext2D
) => {
    const blockingSet = new Set<string>();
    const cache = new Map<string, TLocation>();

    const teacupWidth = ICON_WIDTH;
    const bufferedTeacupWidth = teacupWidth + ICON_BUFFER;

    const teacupHeight = ICON_HEIGHT;
    const bufferedTeacupHeight = teacupHeight + ICON_BUFFER;

    // Determine canvas width and height by number of loops possible
    const width = bufferedTeacupWidth * 22;
    const height = bufferedTeacupHeight * 27;
    const mainCanvas = new OffscreenCanvas(width, height);
    const mainCtx = mainCanvas.getContext('2d', { willReadFrequently: true });

    const overlayCanvas = new OffscreenCanvas(width, height);
    const overlayCtx = overlayCanvas.getContext('2d', {
        willReadFrequently: true,
    });

    if (!mainCtx || !overlayCtx) {
        return;
    }

    const loadTeacup = loadTeacupsConstructor(
        teacupWidth,
        teacupHeight,
        map,
        cache,
        coordinateMap,
        spritesheetContext,
        mainCtx
    );
    const loadTeacupWithAverages = loadTeacupWithAveragesConstructor(
        teacupWidth,
        teacupHeight,
        map,
        cache,
        overlayCanvas,
        coordinateMap,
        spritesheetContext,
        mainCtx,
        overlayCtx
    );

    const levels = [
        100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15,
        10, 5, 0,
    ];

    let i = 0,
        j = 0;
    for (const storage of levels) {
        ({ i, j } = loadTeacup(storage, i, j));
        for (const average of levels) {
            ({ i, j } = loadTeacupWithAverages(storage, average, i, j));
        }
    }

    map.on('style.load', () => {
        blockingSet.clear();
        for (const [id, position] of cache) {
            const { x, y } = position;

            const imageData = mainCtx.getImageData(
                x,
                y,
                teacupWidth,
                teacupHeight
            );

            if (imageData && !map.hasImage(id)) {
                map.addImage(id, imageData);
            }
        }
    });
};
