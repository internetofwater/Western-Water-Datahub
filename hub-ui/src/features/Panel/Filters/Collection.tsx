/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import {
  ComboboxData,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import { useLoading } from "@/hooks/useLoading";
import useMainStore from "@/stores/main";
import { MainState } from "@/stores/main/types";
import { getCategoryLabel, getProviderLabel } from "@/utils/label";

export const Collection: React.FC = () => {
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const setSelectedCollections = useMainStore(
    (state) => state.setSelectedCollections,
  );

  const provider = useMainStore((state) => state.provider);
  const categories = useMainStore((state) => state.categories);
  const collections = useMainStore((state) => state.collections);
  const parameterGroups = useMainStore((state) => state.parameterGroups);

  const [collectionOptions, setCollectionOptions] = useState<ComboboxData>([]);

  const { isFetchingCollections } = useLoading();

  useEffect(() => {
    const collectionOptions: ComboboxData = collections
      .map((collection) => ({
        value: collection.id,
        label: collection.title ?? collection.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    if (
      !collections.some((_collection) =>
        selectedCollections.includes(_collection.id),
      )
    ) {
      setSelectedCollections([]);
    }

    setCollectionOptions(collectionOptions);
  }, [collections]);

  useEffect(() => {
    if (categories.length) {
      const validGroups = parameterGroups.filter((group) =>
        categories.includes(group.label),
      );

      const newSelectedCollections = selectedCollections.filter(
        (collectionId) =>
          validGroups.some(
            (group) => (group.members?.[collectionId] ?? []).length > 0,
          ),
      );
      setSelectedCollections(newSelectedCollections);
    }
  }, [categories]);

  const getDescription = (
    provider: MainState["provider"],
    categories: MainState["categories"],
  ) => {
    if (provider.length > 0 && categories.length > 0) {
      return `Showing data sources available from ${getProviderLabel(provider.length)}: ${provider.join(", ")}, in ${getCategoryLabel(categories.length)}: ${categories.join(", ")}`;
    } else if (provider.length > 0) {
      return `Showing data sources available from ${getProviderLabel(provider.length)}: ${provider.join(", ")}`;
    } else if (categories.length > 0) {
      return `Showing data sources available in ${getCategoryLabel(categories.length)}: ${categories.join(", ")}`;
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
    <Stack gap={0} className={styles.selectStack}>
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={3} size="h4">
            Select a Data Source
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
        label="Data Source"
        multiple
        description={getDescription(provider, categories)}
        placeholder="Select..."
        data={collectionOptions}
        value={selectedCollections}
        onChange={setSelectedCollections}
        disabled={isFetchingCollections}
        withAsterisk
      />
      {isFetchingCollections && (
        <Group>
          <Loader color="blue" type="dots" />
          <Text size="sm">Updating Data Source(s)</Text>
        </Group>
      )}
    </Stack>
  );
};
