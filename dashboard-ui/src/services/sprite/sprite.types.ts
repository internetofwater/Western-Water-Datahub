/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { Map } from 'mapbox-gl';

export enum ELevel {
    One = '1x',
    Two = '2x',
    Four = '4x',
}

export type TDimension = {
    width: number;
    height: number;
};

export type TPosition = TDimension & {
    x: number;
    y: number;
};

export type TImages = Record<ELevel, string>;

export type TSize = Record<ELevel, TDimension>;

export type TSprite = Record<string, TPosition>;

export type TCoordinateMap = {
    images: TImages;
    size: TSize;
    sprites: TSprite;
};

export type TLoadOptions = {
    onDemand?: boolean;
    customLoader?: (
        map: Map,
        coordinateMap: TCoordinateMap,
        context: OffscreenCanvasRenderingContext2D
    ) => void;
};
