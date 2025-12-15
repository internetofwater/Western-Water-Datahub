/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ExpressionSpecification, LayerSpecification } from 'mapbox-gl';
import { LayerType } from '@/components/Map/types';
import { idStoreProperty } from '@/consts/collections';
import { TLayer, TLocation } from '@/stores/main/types';
import { DEFAULT_FILL_OPACITY } from './consts';

export const getPointLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer['color']
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Circle,
    source: sourceId,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 6,
      'circle-color': color,
      'circle-stroke-width': 2,
      'circle-stroke-color': getSelectedColor([]),
    },
  };
};
export const getLineLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer['color'] = '#000'
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Line,
    source: sourceId,
    filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },

    paint: {
      'line-opacity': 1,
      'line-color': color,
      'line-width': 4,
    },
  };
};
export const getFillLayerDefinition = (
  layerId: string,
  sourceId: string,
  color: TLayer['color'] = '#000'
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Fill,
    source: sourceId,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-opacity': DEFAULT_FILL_OPACITY,
      'fill-color': color,
    },
  };
};

export const getSelectedColor = (
  locationIds: Array<TLocation['id']>,
  originalColor: TLayer['color'] = '#000'
): ExpressionSpecification => {
  return [
    'case',
    ['in', ['to-string', ['coalesce', ['get', idStoreProperty], ['id']]], ['literal', locationIds]],
    '#FFF',
    originalColor,
  ];
};
