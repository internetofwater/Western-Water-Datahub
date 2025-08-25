/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ComboboxData } from '@mantine/core';
import { ICollection } from '@/services/edr.service';
import { Collection, Location } from '@/stores/main/types';

export const getParameterNameOptions = (
  parameterNames: ICollection['parameter_names']
): ComboboxData => {
  return Object.values(parameterNames)
    .map((parameterNameEntry) => {
      const unit = parameterNameEntry.unit.symbol.value;

      return {
        value: parameterNameEntry.id,
        label: `${parameterNameEntry.name} (${unit})`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const getDatetime = (from: string | null, to: string | null): string | null => {
  if (from && to) {
    return `${from}/${to}`;
  } else if (from) {
    return `${from}/..`;
  } else if (to) {
    return `../${to}`;
  }
  return null;
};

export const buildUrl = (
  collectionId: Collection['id'],
  locationId: Location['id'],
  parameters: string[],
  from: string | null,
  to: string | null,
  csv: boolean = false
): string => {
  const format = csv ? 'csv' : 'json';

  const url = new URL(
    `https://api.wwdh.internetofwater.app/collections/${collectionId}/locations/${locationId}?f=${format}`
  );

  url.searchParams.set('parameter-name', parameters.join(','));

  const datetime = getDatetime(from, to);

  if (datetime) {
    url.searchParams.set('datetime', datetime);
  }

  return url.toString();
};
