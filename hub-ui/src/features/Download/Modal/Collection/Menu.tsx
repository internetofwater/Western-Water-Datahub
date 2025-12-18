/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Divider, Stack, Text, TextInput } from "@mantine/core";
import styles from "@/features/Download/Download.module.css";
import { ICollection } from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";
import { LocationBlock } from "./LocationBlock";

type Props = {
  collectionId: ICollection["id"];
  mapLocations: string[];
  otherLocations: string[];
  selectedLocations: string[];
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  onClear: () => void;
  linkLocation?: TLocation | null;
};

export const Menu: React.FC<Props> = (props) => {
  const {
    collectionId,
    mapLocations,
    otherLocations: allLocations,
    selectedLocations,
    addLocation,
    removeLocation,
    searchTerm,
    onSearchTermChange,
    onClear,
    linkLocation = null,
  } = props;

  return (
    <Stack className={styles.menu} gap="var(--default-spacing)">
      <TextInput
        size="xs"
        label="Search"
        placeholder="Search across feature properties"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.currentTarget.value)}
      />
      <Button
        size="xs"
        disabled={selectedLocations.length === 0}
        data-disabled={selectedLocations.length === 0}
        onClick={onClear}
        color="red-rocks"
      >
        Deselect All
      </Button>
      {mapLocations.length > 0 || allLocations.length > 0 ? (
        <>
          {mapLocations.length > 0 && (
            <Text size="sm" fw={700}>
              Selected Locations
            </Text>
          )}
          <LocationBlock
            collectionId={collectionId}
            locations={mapLocations}
            selectedLocations={selectedLocations}
            addLocation={addLocation}
            removeLocation={removeLocation}
            linkLocation={linkLocation}
          />
          {mapLocations.length > 0 && allLocations.length > 0 && <Divider />}
          {allLocations.length > 0 && (
            <Text size="sm" fw={700}>
              {mapLocations.length > 0 && "Other "}Locations
            </Text>
          )}
          <LocationBlock
            collectionId={collectionId}
            locations={allLocations}
            selectedLocations={selectedLocations}
            addLocation={addLocation}
            removeLocation={removeLocation}
            linkLocation={linkLocation}
          />
        </>
      ) : (
        <Text size="sm" fw={700}>
          No Locations
        </Text>
      )}
    </Stack>
  );
};
