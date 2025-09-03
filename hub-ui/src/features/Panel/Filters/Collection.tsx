/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { ComboboxData, Group, Select, Stack, Title, Tooltip, VisuallyHidden } from '@mantine/core';
import Info from '@/assets/Info';
import styles from '@/features/Panel/Panel.module.css';
import useMainStore from '@/stores/main';
import { MainState } from '@/stores/main/types';

export const Collection: React.FC = () => {
  const collection = useMainStore((state) => state.collection);
  const setCollection = useMainStore((state) => state.setCollection);

  const provider = useMainStore((state) => state.provider);
  const category = useMainStore((state) => state.category);
  const collections = useMainStore((state) => state.collections);

  const [collectionOptions, setCollectionOptions] = useState<ComboboxData>([]);

  useEffect(() => {
    const collectionOptions: ComboboxData = collections.map((collection) => ({
      value: collection.id,
      label: collection.title ?? collection.id,
    }));

    setCollectionOptions(collectionOptions);
  }, [collections]);

  const getDescription = (provider: MainState['provider'], category: MainState['category']) => {
    if (provider && category) {
      return `Showing collections available for provider: ${provider}, in category: ${category.label}`;
    } else if (provider) {
      return `Showing collections available for provider: ${provider}`;
    } else if (category) {
      return `Showing collections available in category: ${category.label}`;
    }

    return null;
  };

  const helpText = 'Collection tooltip placeholder';

  return (
    <Stack gap={0}>
      {/* TODO */}
      <Tooltip
        label={helpText}
        transitionProps={{ transition: 'fade-right', duration: 300 }}
        position="top-start"
      >
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h3">
            Filter by Collection
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
        label="Collection"
        description={getDescription(provider, category)}
        placeholder="Select..."
        data={collectionOptions}
        value={collection}
        onChange={setCollection}
        searchable
        clearable
      />
    </Stack>
  );
};
