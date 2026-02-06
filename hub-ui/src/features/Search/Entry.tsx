/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { GeoJsonProperties } from "geojson";
import { Stack, Text, TextInput } from "@mantine/core";
import { StringIdentifierCollections } from "@/consts/collections";
import styles from "@/features/Search/Search.module.css";
import { useLocations } from "@/hooks/useLocations";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";
import { hasSearchTerm } from "@/utils/searchFeatures";
import { sortObject } from "@/utils/sortObject";
import { Matches } from "./Matches";
import { Properties } from "./Properties";
import { getId } from "./utils";

type Props = {
  layer: TLayer;
};

export const Entry: React.FC<Props> = (props) => {
  const { layer } = props;

  const [title, setTitle] = useState("");
  const [sampleProperties, setSampleProperties] =
    useState<GeoJsonProperties>(null);

  const { selectedLocations, otherLocations } = useLocations(layer);

  const search = useMainStore((state) => state.searches).find(
    (search) => search.collectionId === layer.collectionId,
  ) ?? {
    collectionId: layer.collectionId,
    searchTerm: "",
    matchedLocations: [],
  };
  const addSearchTerm = useMainStore((state) => state.addSearch);
  const removeSearchTerm = useMainStore((state) => state.removeSearch);

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection && collection?.title) {
      setTitle(collection.title);
    }
  }, [layer]);

  useEffect(() => {
    const location =
      selectedLocations.length > 0
        ? selectedLocations[0]
        : otherLocations.length > 0
          ? otherLocations[0]
          : null;

    if (location) {
      setSampleProperties(sortObject(location.properties));
    }
  }, [selectedLocations, otherLocations]);

  const isStringIdentifierCollection = StringIdentifierCollections.includes(
    layer.collectionId,
  );

  const handleChange = (searchTerm: string) => {
    if (searchTerm.length === 0) {
      removeSearchTerm(layer.collectionId);
      return;
    }

    const matchedLocations = [...selectedLocations, ...otherLocations]
      .filter((feature) => hasSearchTerm(searchTerm, feature))
      .map((feature) => getId(feature, isStringIdentifierCollection));

    addSearchTerm(layer.collectionId, searchTerm, matchedLocations);
  };

  const showMatches = search.matchedLocations.length > 0;
  const showProperties =
    !showMatches && sampleProperties && search.searchTerm.length === 0;

  return (
    <Stack className={styles.entry} gap="calc(var(--default-spacing) / 2)">
      <Text size="sm" fw={700} lineClamp={1} title={title}>
        {title}
      </Text>
      <TextInput
        value={search.searchTerm}
        onChange={(event) => handleChange(event.currentTarget.value)}
        placeholder="Search all features in data source"
      />
      {showMatches && (
        <Matches
          collectionId={layer.collectionId}
          searchTerm={search.searchTerm}
          matchedLocations={search.matchedLocations}
          selectedLocations={selectedLocations}
          otherLocations={otherLocations}
          isStringIdentifierCollection={isStringIdentifierCollection}
          lineLimit={5}
          locationLimit={10}
        />
      )}
      {showProperties && <Properties properties={sampleProperties} />}
      {!showMatches && !showProperties && (
        <Text size="sm" ta="center" mt="calc(var(--default-spacing) * 1)">
          No locations found.
        </Text>
      )}
    </Stack>
  );
};
