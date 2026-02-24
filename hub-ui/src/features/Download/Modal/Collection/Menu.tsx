/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Divider, Stack, Text, TextInput } from "@mantine/core";
import styles from "@/features/Download/Download.module.css";
import { LocationBlock } from "@/features/Download/Modal/Collection/LocationBlock";
import { ICollection } from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";
import { CollectionType } from "@/utils/collection";

type Props = {
  collectionId: ICollection["id"];
  collectionType: CollectionType;
  mapLocations: { id: string; label: string }[];
  otherLocations: { id: string; label: string }[];
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
    collectionType,
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

  const getLabel = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "Location";
      case CollectionType.EDRGrid:
        return "Grid";
      default:
        return "Item";
    }
  };

  return (
    <Stack className={styles.menu} gap="var(--default-spacing)">
      <TextInput
        size="xs"
        label="Search"
        placeholder="Search across feature properties"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.currentTarget.value)}
      />
      {mapLocations.length > 0 || allLocations.length > 0 ? (
        <>
          {mapLocations.length > 0 && (
            <Text size="sm" fw={700}>
              Selected {getLabel()}s
            </Text>
          )}
          <LocationBlock
            collectionId={collectionId}
            collectionType={collectionType}
            locations={mapLocations}
            selectedLocations={selectedLocations}
            addLocation={addLocation}
            removeLocation={removeLocation}
            linkLocation={linkLocation}
          />
          {mapLocations.length > 0 && allLocations.length > 0 && <Divider />}
          {allLocations.length > 0 && (
            <Text size="sm" fw={700}>
              {mapLocations.length > 0 && "Other "}
              {getLabel()}s
            </Text>
          )}
          <LocationBlock
            collectionId={collectionId}
            collectionType={collectionType}
            locations={allLocations}
            selectedLocations={selectedLocations}
            addLocation={addLocation}
            removeLocation={removeLocation}
            linkLocation={linkLocation}
          />
        </>
      ) : (
        <Text size="sm" fw={700}>
          No {getLabel()}s
        </Text>
      )}
      <Button
        size="xs"
        disabled={selectedLocations.length === 0}
        data-disabled={selectedLocations.length === 0}
        onClick={onClear}
        color="red-rocks"
      >
        Deselect All
      </Button>
    </Stack>
  );
};
