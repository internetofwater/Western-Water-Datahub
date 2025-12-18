/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Checkbox, NumberInput, Pagination, Stack } from "@mantine/core";
import { ICollection } from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";
import { chunk } from "@/utils/chunk";

type Props = {
  collectionId: ICollection["id"];
  locations: string[];
  selectedLocations: string[];
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  linkLocation?: TLocation | null;
};
export const LocationBlock: React.FC<Props> = (props) => {
  const {
    collectionId,
    locations,
    selectedLocations,
    addLocation,
    removeLocation,
    linkLocation = null,
  } = props;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    locations.length > 10 ? 10 : locations.length,
  );
  const [chunkedLocations, setChunkedLocations] = useState<string[][]>([]);
  const [currentChunk, setCurrentChunk] = useState<string[]>([]);

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setPage(1);
  };

  useEffect(() => {
    setPageSize(locations.length > 10 ? 10 : locations.length);
  }, [locations]);

  useEffect(() => {
    const chunkedLocations = chunk(locations, pageSize);
    setChunkedLocations(chunkedLocations);
  }, [locations, pageSize]);

  useEffect(() => {
    if (!linkLocation || chunkedLocations.length === 0) {
      return;
    }

    for (let i = 0; i < chunkedLocations.length; i++) {
      const linkLocationInChunk = chunkedLocations[i].some(
        (location) => location === linkLocation.id,
      );
      if (linkLocationInChunk) {
        setPage(i + 1);
        break;
      }
    }
  }, [chunkedLocations]);

  useEffect(() => {
    if (chunkedLocations.length === 0 || chunkedLocations.length < page) {
      setCurrentChunk([]);
      return;
    }

    const currentChunk = chunkedLocations[page - 1];
    setCurrentChunk(currentChunk);
  }, [chunkedLocations, page]);

  const handleChange = (checked: boolean, locationId: string) => {
    if (checked) {
      addLocation(locationId);
    } else {
      removeLocation(locationId);
    }
  };

  return (
    <Stack component="section" gap="var(--default-spacing)">
      {currentChunk.map((locationId) => (
        <Checkbox
          size="xs"
          key={`${collectionId}-location-select-${locationId}`}
          label={locationId}
          checked={selectedLocations.includes(locationId)}
          onChange={(event) =>
            handleChange(event.currentTarget.checked, locationId)
          }
        />
      ))}

      {chunkedLocations.length > pageSize && (
        <>
          <NumberInput
            size="xs"
            label="Locations per page"
            value={pageSize}
            onChange={(value) => handlePageSizeChange(Number(value))}
            min={1}
            max={locations.length}
          />
          <Pagination
            size="sm"
            total={chunkedLocations.length}
            value={page}
            onChange={setPage}
            mt="sm"
          />
        </>
      )}
    </Stack>
  );
};
