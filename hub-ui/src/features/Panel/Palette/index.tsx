/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import mainManager from '@/managers/Main.init';
import useMainStore from '@/stores/main';
import { CollectionType, getCollectionType } from '@/utils/collection';
import { Palette } from './Palette';

const PaletteWrapper: React.FC = () => {
  const selectedCollections = useMainStore((state) => state.selectedCollections);

  const [gridCollections, setGridCollections] = useState<string[]>([]);

  useEffect(() => {
    const gridCollections: string[] = [];

    selectedCollections.forEach((collectionId) => {
      const collection = mainManager.getCollection(collectionId);
      if (collection) {
        const collectionType = getCollectionType(collection);

        if (collectionType === CollectionType.EDRGrid) {
          gridCollections.push(collectionId);
        }
      }
    });

    setGridCollections(gridCollections);
  }, [selectedCollections]);

  if (gridCollections.length === 0) {
    return null;
  }

  return (
    <Stack gap={0}>
      {gridCollections.map((collectionId) => (
        <Palette key={`parameter-select-${collectionId}`} collectionId={collectionId} />
      ))}
    </Stack>
  );
};

export default PaletteWrapper;
