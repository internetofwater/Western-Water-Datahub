/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Feature } from "geojson";
import { Stack, Text, TextInput } from "@mantine/core";
import { StringIdentifierCollections } from "@/consts/collections";
import styles from "@/features/Search/Search.module.css";
import { useLocations } from "@/hooks/useLocations";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";
import { getIdStore } from "@/utils/getIdStore";
import { hasSearchTerm } from "@/utils/searchFeatures";

type Props = {
  layer: TLayer;
};

export const Entry: React.FC<Props> = (props) => {
  const { layer } = props;

  const [title, setTitle] = useState("");

  const { selectedLocations, otherLocations } = useLocations(layer);

  const search = useMainStore((state) => state.searchTerms).find(
    (search) => search.collectionId === layer.collectionId,
  ) ?? {
    collectionId: layer.collectionId,
    searchTerm: "",
    matchedLocations: [],
  };
  const addSearchTerm = useMainStore((state) => state.addSearchTerm);
  const removeSearchTerm = useMainStore((state) => state.removeSearchTerm);

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection && collection?.title) {
      setTitle(collection.title);
    }
  }, [layer]);

  const isStringIdentifierCollection = StringIdentifierCollections.includes(
    layer.collectionId,
  );

  const getId = (feature: Feature) => {
    if (isStringIdentifierCollection) {
      return getIdStore(feature) ?? String(feature.id);
    }

    return String(feature.id);
  };

  const handleChange = (searchTerm: string) => {
    if (searchTerm.length === 0) {
      removeSearchTerm(layer.collectionId);
    }

    const matchedLocations = [...selectedLocations, ...otherLocations]
      .filter((feature) => hasSearchTerm(searchTerm, feature))
      .map((feature) => getId(feature));

    addSearchTerm(layer.collectionId, searchTerm, matchedLocations);
  };

  return (
    <Stack className={styles.entry} gap="calc(var(--default-spacing) / 2)">
      <Text size="sm" fw={700} lineClamp={1} title={title}>
        {title}
      </Text>
      <TextInput
        value={search.searchTerm}
        onChange={(event) => handleChange(event.currentTarget.value)}
      />
    </Stack>
  );
};
