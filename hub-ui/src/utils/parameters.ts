/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionId } from '@/consts/collections';
import { ICollection, ParameterName } from '@/services/edr.service';

const getParameters = (collection: ICollection, limit: number = 5): string[] => {
  if (!collection.parameter_names || typeof collection.parameter_names !== 'object') {
    return [];
  }

  if (limit < 0) {
    return Object.values(collection.parameter_names).map((parameterName) => parameterName.name);
  }
  let _limit = limit;
  if (limit > 50) {
    _limit = 50;
  }

  return Object.values(collection.parameter_names)
    .slice(0, _limit)
    .map((parameterName) => {
      const unit = getParameterUnit(parameterName);
      return `${parameterName.name} (${unit})`;
    });
};

export const getParameterList = (
  collection: ICollection,
  limit: number = 5,
  useDefault: boolean = true
): string[] => {
  if (useDefault) {
    switch (collection.id) {
      case CollectionId.RISEEdr:
        return [
          'Lake/Reservoir Storage',
          'Lake/Reservoir Area',
          'Air Temperature',
          'Precipitation',
          'Stream Gage Height',
        ];
    }
  }

  return getParameters(collection, limit);
};

export const getParameterUnit = (parameterName: ParameterName) => {
  return parameterName.unit?.label?.en ?? parameterName.unit.symbol.value;
};

export const getLabel = (collection: ICollection, parameterId: string) => {
  const parameter = collection.parameter_names[parameterId];
  const unit = getParameterUnit(parameter);

  return `${parameter.name} (${unit})`;
};
