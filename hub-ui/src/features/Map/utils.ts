/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ExpressionSpecification, LayerSpecification } from 'mapbox-gl';
import { LayerType } from '@/components/Map/types';
import { Location } from '@/stores/main/types';
import { getRandomHexColor } from '@/utils/hexColor';

export const getPointLayerDefinition = (layerId: string, sourceId: string): LayerSpecification => {
  return {
    id: layerId,
    source: sourceId,
    type: LayerType.Circle,
    paint: {
      'circle-radius': 6,
      'circle-color': getRandomHexColor(),
      'circle-stroke-width': 2,
      'circle-stroke-color': getCircleStrokeColor([]),
    },
  };
};

export const getPolygonLayerDefinition = (
  layerId: string,
  sourceId: string
): LayerSpecification => {
  return {
    id: layerId,
    type: LayerType.Line,
    source: sourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-opacity': 1,
      'line-color': '#000',
      'line-width': 2,
    },
  };
};

export const getCircleStrokeColor = (
  locationIds: Array<Location['id']>
): ExpressionSpecification => {
  return ['case', ['in', ['id'], ['literal', locationIds]], '#FFF', '#000'];
};
