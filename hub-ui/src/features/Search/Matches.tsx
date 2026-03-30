/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { MouseEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { bbox } from "@turf/turf";
import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { LngLatBoundsLike } from "mapbox-gl";
import { Box, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { useMap } from "@/contexts/MapContexts";
import styles from "@/features/Search/Search.module.css";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { TLocation } from "@/stores/main/types";
import { getLabel } from "@/utils/getLabel";
import { MAP_ID } from "../Map/config";
import { getId, highlightMatches } from "./utils";

type Props = {
  collectionId: ICollection["id"];
  searchTerm: string;
  matchedLocations: string[];
  selectedLocations: Feature<Geometry, GeoJsonProperties>[];
  otherLocations: Feature<Geometry, GeoJsonProperties>[];
  isStringIdentifierCollection: boolean;
  lineLimit: number;
  locationLimit: number;
};

export const Matches: React.FC<Props> = (props) => {
  const {
    collectionId,
    searchTerm,
    matchedLocations,
    selectedLocations,
    otherLocations,
    isStringIdentifierCollection,
    lineLimit = 5,
    locationLimit = 10,
  } = props;

  const addLocation = useMainStore((state) => state.addLocation);
  const removeLocation = useMainStore((state) => state.removeLocation);

  const [labelProperty, setLabelProperty] = useState<string | null>(null);

  const { map } = useMap(MAP_ID);

  useEffect(() => {
    const layer = mainManager.getLayer({ collectionId });

    if (layer) {
      setLabelProperty(layer.label);
    }
  }, [collectionId]);

  const handleSelect = (id: TLocation["id"]) => {
    addLocation({
      id,
      collectionId,
    });
  };

  const handleDeselect = (id: TLocation["id"]) => {
    removeLocation(id);
  };

  const handleViewOnMap = (
    event: MouseEvent<HTMLButtonElement>,
    feature: Feature,
  ) => {
    event.stopPropagation();

    if (!map) {
      return;
    }
    const bounds = bbox(feature) as LngLatBoundsLike;
    map!.fitBounds(bounds, {
      padding: 40,
      speed: 3,
    });
  };

  const matchedSet = useMemo(
    () => new Set(matchedLocations),
    [matchedLocations],
  );

  // Bail early if no term — avoids heavy work entirely
  const hasTerm = !!searchTerm?.trim();
  const empty = !hasTerm;

  const selectedMatches = useMemo(() => {
    if (empty) {
      return [];
    }
    const nodes: ReactNode[] = [];
    for (const location of selectedLocations) {
      const id = getId(location, isStringIdentifierCollection);
      if (!matchedSet.has(id)) {
        continue;
      }
      const label = labelProperty ? getLabel(location, labelProperty) : null;
      if (location.properties) {
        const lines = highlightMatches(
          location.properties,
          searchTerm,
          lineLimit,
        );
        if (lines.length) {
          nodes.push(
            <Box key={`sel-${id}`} component="div">
              <Text size="sm">
                Location: {label ? `${label} (${id})` : id}, matches{" "}
                {lines.length === lineLimit && <>(Top 5)</>}:
              </Text>
              <Group
                gap="calc(var(--default-spacing) / 4)"
                justify="space-between"
              >
                <Stack
                  gap="calc(var(--default-spacing) / 1.75)"
                  className={styles.searchResults}
                >
                  {lines}
                </Stack>
                <Stack gap="calc(var(--default-spacing) / 4)">
                  <Button
                    onClick={() => handleDeselect(id)}
                    size="xs"
                    p="var(--default-spacing)"
                  >
                    Deselect
                  </Button>
                  <Button
                    onClick={(e) => handleViewOnMap(e, location)}
                    size="xs"
                    p="var(--default-spacing)"
                  >
                    Go to
                  </Button>
                </Stack>
              </Group>
            </Box>,
          );
        }
      }
    }
    return nodes;
  }, [
    empty,
    selectedLocations,
    labelProperty,
    matchedSet,
    isStringIdentifierCollection,
    searchTerm,
    lineLimit,
  ]);

  const otherMatches = useMemo(() => {
    if (empty) {
      return [];
    }
    const nodes: ReactNode[] = [];
    for (const location of otherLocations) {
      const id = getId(location, isStringIdentifierCollection);
      if (!matchedSet.has(id)) {
        continue;
      }
      const label = labelProperty ? getLabel(location, labelProperty) : null;
      if (location.properties) {
        const lines = highlightMatches(
          location.properties,
          searchTerm,
          lineLimit,
        );
        if (lines.length) {
          nodes.push(
            <Box key={`oth-${id}`} component="div">
              <Text size="sm">
                Location: {label ? `${label} (${id})` : id}, matches{" "}
                {lines.length === lineLimit && <>(Top 5)</>}:
              </Text>
              <Group
                gap="calc(var(--default-spacing) / 4)"
                justify="space-between"
              >
                <Stack
                  gap="calc(var(--default-spacing) / 1.75)"
                  className={styles.searchResults}
                >
                  {lines}
                </Stack>
                <Stack gap="calc(var(--default-spacing) / 4)">
                  <Button
                    onClick={() => handleSelect(id)}
                    size="xs"
                    p="var(--default-spacing)"
                  >
                    Select
                  </Button>
                  <Button
                    onClick={(e) => handleViewOnMap(e, location)}
                    size="xs"
                    p="var(--default-spacing)"
                  >
                    Go to
                  </Button>
                </Stack>
              </Group>
            </Box>,
          );
        }
      }
      if (nodes.length >= locationLimit) {
        break;
      }
    }
    return nodes;
  }, [
    empty,
    otherLocations,
    labelProperty,
    matchedSet,
    isStringIdentifierCollection,
    searchTerm,
    lineLimit,
    locationLimit,
  ]);

  const hasSelectedMatches = selectedMatches.length > 0;
  const hasOtherMatches = otherMatches.length > 0;

  return (
    <>
      {hasSelectedMatches && (
        <Stack gap="var(--default-spacing)">
          <Text
            size="md"
            fw={700}
            mt="calc(var(--default-spacing) / -4)"
            mb="calc(var(--default-spacing) * -1)"
          >
            Selected Locations
          </Text>
          {selectedMatches}
        </Stack>
      )}
      {hasSelectedMatches && hasOtherMatches && <Divider />}
      {hasOtherMatches && (
        <Stack gap="var(--default-spacing)">
          <Text
            size="md"
            fw={700}
            mt="calc(var(--default-spacing) / -4)"
            mb="calc(var(--default-spacing) * -1)"
          >
            {hasSelectedMatches && <>Other</>} Locations{" "}
            {otherMatches.length === locationLimit && (
              <>(Top {locationLimit})</>
            )}
          </Text>
          {otherMatches}
        </Stack>
      )}
    </>
  );
};
