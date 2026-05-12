/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Map } from 'mapbox-gl';
import { TCoordinateMap } from '@/services/sprite/sprite.types';
import { isCoordinateMap, loadImageFile } from '@/services/sprite/sprite.utils';

type TLoadOptions = {
    onDemand?: boolean;
    customLoader?: (
        map: Map,
        coordinateMap: TCoordinateMap,
        context: OffscreenCanvasRenderingContext2D
    ) => void;
};

export class SpriteService {
    private sheetUrl: string;
    private coordinateMapUrl: string;
    private coordinateMap: TCoordinateMap | null = null;
    private context: OffscreenCanvasRenderingContext2D | null = null;

    constructor(sheetUrl: string, coordinateMapUrl: string) {
        this.sheetUrl = sheetUrl;
        this.coordinateMapUrl = coordinateMapUrl;
    }

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

    public ready(): boolean {
        return this.coordinateMap !== null && this.context !== null;
    }

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
                const entry = Object.entries(coordinateMap.sprites).find(
                    ([key]) => key === id
                );
                if (entry) {
                    const [key, position] = entry;
                    if (!map.hasImage(key)) {
                        const { x, y, width, height } = position;
                        const imageData = context.getImageData(
                            x,
                            y,
                            width,
                            height
                        );

                        map.addImage(key, imageData);
                    }
                }
            }
        });

        map.on('style.load', () => {
            blockingSet.clear();
        });
    }

    private loadImages(
        map: Map,
        coordinateMap: TCoordinateMap,
        context: OffscreenCanvasRenderingContext2D
    ) {
        for (const [key, position] of Object.entries(coordinateMap.sprites)) {
            if (!map.hasImage(key)) {
                const { x, y, width, height } = position;
                const imageData = context.getImageData(x, y, width, height);
                map.addImage(key, imageData);
            }
        }
    }

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
