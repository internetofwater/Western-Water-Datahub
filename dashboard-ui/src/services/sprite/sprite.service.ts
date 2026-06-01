/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Map } from 'mapbox-gl';
import { TCoordinateMap, TLoadOptions } from '@/services/sprite/sprite.types';
import { isCoordinateMap, loadImageFile } from '@/services/sprite/sprite.utils';

export class SpriteService {
    private sheetUrl: string;
    private coordinateMapUrl: string;
    private coordinateMap: TCoordinateMap | null = null;
    private context: OffscreenCanvasRenderingContext2D | null = null;

    constructor(sheetUrl: string, coordinateMapUrl: string) {
        this.sheetUrl = sheetUrl;
        this.coordinateMapUrl = coordinateMapUrl;
    }

    /**
     * Loads the coordinate map from the provided URL and stores in class variable.
     *
     * @public
     * @async
     * @returns {Promise<boolean>}
     */
    public async loadCoordinateMap(): Promise<boolean> {
        if (this.coordinateMapUrl.length === 0) {
            // TODO: throw error?
            return false;
        }

        const response = await fetch(this.coordinateMapUrl);
        const json: unknown = await response.json();
        if (isCoordinateMap(json)) {
            this.coordinateMap = json;
            return true;
        }
        // TODO: throw error?

        return false;
    }

    /**
     * Loads the spritesheet from the provided URL, draws it onto an offscreen canvas,
     * and stores the canvas context in a class variable.
     *
     * @public
     * @async
     * @returns {Promise<boolean>}
     */
    public async loadSpritesheet(): Promise<boolean> {
        if (this.sheetUrl.length === 0) {
            // TODO: throw error?
            return false;
        }

        const image = await loadImageFile(this.sheetUrl);
        const { naturalWidth: width, naturalHeight: height } = image;
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
            context.drawImage(image, 0, 0);
            this.context = context;
            return true;
        }

        return false;
    }

    /**
     * Indicate if the coordinate map and spritesheet canvas context exist.
     *
     * @public
     * @returns {boolean}
     */
    public ready(): boolean {
        return this.coordinateMap !== null && this.context !== null;
    }

    /**
     * Listens for missing icon event and attempts to extract the missing icon from the spritesheet.
     *
     * @private
     * @param {Map} map - Mapbox GL JS map
     * @param {TCoordinateMap} coordinateMap - JSON doc that provides the necessary info for
     *  extracting icons from the Spritesheet canvas
     * @param {OffscreenCanvasRenderingContext2D} context - Spritesheet canvas context (will read frequently)
    
     */
    private loadOnDemand(
        map: Map,
        coordinateMap: TCoordinateMap,
        context: OffscreenCanvasRenderingContext2D
    ) {
        const blockingSet = new Set<string>();
        map.on('styleimagemissing', (e) => {
            const { id } = e;
            if (!blockingSet.has(id)) {
                blockingSet.add(id);
                const position = coordinateMap.sprites[id];

                const { x, y, width, height } = position;
                const imageData = context.getImageData(x, y, width, height);

                if (map.hasImage(id)) {
                    map.updateImage(id, imageData);
                } else {
                    map.addImage(id, imageData);
                }
            }
        });

        map.on('style.load', () => {
            blockingSet.clear();
        });
    }

    /**
     * Loads all icons listed in the coordinate map from the spriteshet into the Mapbox GL instance
     *
     * @private
     * @param {Map} map - Mapbox GL JS map
     * @param {TCoordinateMap} coordinateMap - JSON doc that provides the necessary info for
     *  extracting icons from the Spritesheet canvas
     * @param {OffscreenCanvasRenderingContext2D} context - Spritesheet canvas context (will read frequently)
     */
    private loadImages(
        map: Map,
        coordinateMap: TCoordinateMap,
        context: OffscreenCanvasRenderingContext2D
    ) {
        for (const [key, position] of Object.entries(coordinateMap.sprites)) {
            const { x, y, width, height } = position;
            const imageData = context.getImageData(x, y, width, height);
            if (map.hasImage(key)) {
                map.updateImage(key, imageData);
            } else {
                map.addImage(key, imageData);
            }
        }
    }

    /**
     * Integrates SpriteService with Mapbox GL instance. Options allow loading icons when the map indicates
     * an icon is missing or use of a custom loader function.
     *
     * @public
     * @param {Map} map - Mapbox GL JS map
     * @param {TLoadOptions} [options={ onDemand: false }]
     */
    public load(map: Map, options: TLoadOptions = { onDemand: false }) {
        if (!this.coordinateMap) {
            throw new Error('Coordinate map has not been loaded');
        }

        if (!this.context) {
            throw new Error('Spritesheet map has not been loaded');
        }

        const { onDemand, customLoader } = options;

        if (onDemand) {
            this.loadOnDemand(map, this.coordinateMap, this.context);
            return;
        }

        if (customLoader) {
            customLoader(map, this.coordinateMap, this.context);
            return;
        }

        this.loadImages(map, this.coordinateMap, this.context);
        return;
    }
}
