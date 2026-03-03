/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
  Box,
  ComboboxData,
  ComboboxItem,
  Group,
  MultiSelectProps,
} from "@mantine/core";
import Features from "@/assets/Features";
import Grid from "@/assets/Grid";
import LineChart from "@/assets/LineChart";
import Raster from "@/assets/Raster";
import styles from "@/features/Panel/Panel.module.css";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import { CollectionType, getCollectionType } from "@/utils/collection";

export const getOptions = (collections: ICollection[]): ComboboxData => {
  return collections
    .map((collection) => ({
      value: collection.id,
      label: collection.title ?? collection.id,
      type: getCollectionType(collection),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const getIcon = (type: CollectionType) => {
  switch (type) {
    case CollectionType.EDR:
      return <LineChart />;
    case CollectionType.EDRGrid:
      return <Grid />;
    case CollectionType.Features:
      return <Features />;
    case CollectionType.Map:
      return <Raster />;
    case CollectionType.Unknown:
    default:
      return null;
  }
};

export type ExtendedItem = ComboboxItem & {
  type: CollectionType;
};

export const renderOption: MultiSelectProps["renderOption"] = ({ option }) => {
  const { type, label } = option as ExtendedItem;

  const icon = getIcon(type);

  return (
    <Group
      gap="calc(var(--default-spacing) / 2)"
      justify="space-between"
      className={styles.datasourceOption}
      wrap="nowrap"
    >
      {icon}
      <Box component="span" className={styles.datasourceOptionLabel}>
        {label}
      </Box>
    </Group>
  );
};

export const showParameterSelect = (collectionId: ICollection["id"]) => {
  const collection = mainManager.getCollection(collectionId);

  if (collection) {
    const collectionType = getCollectionType(collection);

    return [CollectionType.EDR, CollectionType.EDRGrid].includes(
      collectionType,
    );
  }

  return false;
};

export const showPalette = (collectionId: ICollection["id"]) => {
  const collection = mainManager.getCollection(collectionId);

  if (collection) {
    const collectionType = getCollectionType(collection);

    return CollectionType.EDRGrid === collectionType;
  }

  return false;
};
