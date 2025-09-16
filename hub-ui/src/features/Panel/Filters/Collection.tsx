/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import {
  ComboboxData,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import { useLoading } from "@/hooks/useLoading";
import useMainStore from "@/stores/main";
import { MainState } from "@/stores/main/types";

export const Collection: React.FC = () => {
  const collection = useMainStore((state) => state.collection);
  const setCollection = useMainStore((state) => state.setCollection);

  const provider = useMainStore((state) => state.provider);
  const category = useMainStore((state) => state.category);
  const collections = useMainStore((state) => state.collections);

  const [collectionOptions, setCollectionOptions] = useState<ComboboxData>([]);

  const { isFetchingCollections } = useLoading();

  useEffect(() => {
    const collectionOptions: ComboboxData = collections
      .map((collection) => ({
        value: collection.id,
        label: collection.description ?? collection.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    if (!collections.some((_collection) => _collection.id === collection)) {
      setCollection(null);
    }

    setCollectionOptions(collectionOptions);
  }, [collections]);

  const getDescription = (
    provider: MainState["provider"],
    category: MainState["category"],
  ) => {
    if (provider && category) {
      return `Showing data sources available for provider: ${provider}, about category: ${category.label}`;
    } else if (provider) {
      return `Showing data sources available from provider: ${provider}`;
    } else if (category) {
      return `Showing data sources available about category: ${category.label}`;
    }

    return null;
  };

  const helpText = (
    <>
      <Text size="sm">Select a data source to add locations from.</Text>
      <br />
      <Text size="sm">
        Locations connect scientific measurements to a geographic point on the
        map.
      </Text>
    </>
  );

  return (
    <Stack gap={0}>
      {/* TODO */}
      <Tooltip multiline label={helpText}>
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
        disabled={isFetchingCollections}
        searchable
        clearable
      />
      {isFetchingCollections && (
        <Group>
          <Loader color="blue" type="dots" />
          <Text size="sm">Updating Collections</Text>
        </Group>
      )}
    </Stack>
  );
};
