/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICollection } from '@/services/edr.service';
import { MainState } from '@/stores/main/types';
import { getProvider } from '@/utils/provider';

export const filterCollections = (
  collections: MainState['collections'],
  search: MainState['search'],
  provider: MainState['provider'],
  category: MainState['category'],
  parameterGroupMembers: MainState['parameterGroupMembers']
) => {
  const filterFunctions: Array<(collection: ICollection) => boolean> = [];
  if (search) {
    const lower = search.toLowerCase();

    // Does collection match the search term on the collection title, parameters or unit?
    const filterFunction = (collection: ICollection) => {
      const parameters = Object.values(collection.parameter_names ?? {});
      return (
        (collection.title ?? '').toLowerCase().includes(lower) ||
        parameters.some(
          (parameter) =>
            parameter.name.toLowerCase().includes(lower) ||
            (parameter.unit?.symbol?.value ?? '').toLowerCase().includes(lower)
        )
      );
    };
    filterFunctions.push(filterFunction);
  }
  if (category) {
    const categoryMembers = parameterGroupMembers[category.value];
    filterFunctions.push((collection) => categoryMembers.includes(collection.id));
  }

  if (provider && provider.length > 0) {
    filterFunctions.push((collection) => getProvider(collection.id) === provider);
  }

  return collections
    .filter(
      (collection) =>
        filterFunctions.length === 0 || filterFunctions.every((filter) => filter(collection))
    )
    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
};
