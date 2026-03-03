/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Feature } from "geojson";
import {
  Group,
  NumberInput,
  Pagination,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import styles from "@/features/Download/Download.module.css";
import { Grid } from "@/features/Download/Modal/Collection/Grid";
import { Header } from "@/features/Download/Modal/Collection/Header";
import { Item } from "@/features/Download/Modal/Collection/Item";
import { Location } from "@/features/Download/Modal/Collection/Location";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { ICollection } from "@/services/edr.service";
import { TLayer, TLocation } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { ENotificationType } from "@/stores/session/types";
import { chunk } from "@/utils/chunk";
import { CollectionType } from "@/utils/collection";
import { buildCubeUrl, buildItemsUrl, buildLocationsUrl } from "@/utils/url";
import { LocationsChart } from "./LocationsChart";

type Props = {
  locations: Feature[];
  collection: ICollection;
  collectionType: CollectionType;
  layer: TLayer;
  linkLocation?: TLocation | null;
};

export const LayerBlock: React.FC<Props> = (props) => {
  const {
    locations,
    collection,
    collectionType,
    layer,
    linkLocation = null,
  } = props;

  const hasNotification = useSessionStore((state) => state.hasNotification);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [chunkedLocations, setChunkedLocations] = useState<Feature[][]>([]);
  const [currentChunk, setCurrentChunk] = useState<Feature[]>([]);
  const [url, setUrl] = useState("");

  const locationRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const mobile = useMediaQuery("(max-width: 899px)");

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setPage(1);
  };

  useEffect(() => {
    try {
      let url = "";
      if (collectionType === CollectionType.EDR) {
        url = buildLocationsUrl(collection.id, layer.parameters);
      } else if (collectionType === CollectionType.EDRGrid) {
        const bbox = mainManager.getBBox(collection.id, true);
        url = buildCubeUrl(
          collection.id,
          bbox,
          layer.parameters,
          layer.from,
          layer.to,
          false,
          true,
        );
      } else if (collectionType === CollectionType.Features) {
        url = buildItemsUrl(collection.id);
      }

      setUrl(url);
    } catch (error) {
      console.error(error);
      // TODO: determine cause of duplicates
      const message = `Unable to create base URL for layer: ${collection.title}. Skipping this entry in the Export modal.`;
      if (!hasNotification(message)) {
        notificationManager.show(message, ENotificationType.Error, 10000);
      }
    }
  }, [collection, collectionType]);

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
        (location) => String(location.id) === linkLocation.id,
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

  useEffect(() => {
    if (linkLocation?.id && locationRefs.current[linkLocation.id]) {
      locationRefs.current[linkLocation.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentChunk]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  const getLabel = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "location";
      case CollectionType.EDRGrid:
        return "grid";
      default:
        return "item";
    }
  };

  const getTitle = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "Locations";
      case CollectionType.EDRGrid:
        return "Grids";
      default:
        return "Items";
    }
  };

  return (
    <Stack
      component="section"
      gap="var(--default-spacing)"
      className={styles.locationBlockWrapper}
    >
      <Paper shadow="xs" p="var(--default-spacing)" className={styles.summary}>
        <Stack gap="var(--default-spacing)">
          <Header url={url} collectionType={collectionType} />
          {currentChunk.length === 0 && (
            <Text fw={700} m="auto">
              Select {getLabel()}s from the menu{" "}
              {mobile ? "above" : "on the left"}
            </Text>
          )}

          {collection && collectionType === CollectionType.EDR && (
            <>
              <LocationsChart layer={layer} locations={currentChunk} />
            </>
          )}
        </Stack>
      </Paper>
      {collection && currentChunk.length > 0 && (
        <Paper
          shadow="xs"
          p="var(--default-spacing)"
          className={styles.summary}
        >
          <Stack gap="var(--default-spacing)">
            {collection && collectionType === CollectionType.EDR && (
              <Title order={5} size="h4">
                {getTitle()}
              </Title>
            )}

            {collectionType === CollectionType.EDR &&
              currentChunk.map((location) => (
                <Location
                  key={`selected-location-${layer.id}-${location.id}`}
                  linkLocation={linkLocation}
                  location={location}
                  layer={layer}
                  collection={collection}
                />
              ))}
            {collectionType === CollectionType.EDRGrid &&
              currentChunk.map((location) => (
                <Grid
                  key={`selected-grid-${layer.id}-${location.id}`}
                  linkLocation={linkLocation}
                  location={location}
                  layer={layer}
                  collection={collection}
                />
              ))}
            {collectionType === CollectionType.Features &&
              currentChunk.map((location) => (
                <Item
                  key={`selected-item-${layer.id}-${location.id}`}
                  linkLocation={linkLocation}
                  location={location}
                  layer={layer}
                  collection={collection}
                />
              ))}
            <Group justify="space-between" align="flex-end">
              {currentChunk.length > 0 && (
                <NumberInput
                  size="xs"
                  label="Locations per page"
                  value={pageSize}
                  onChange={(value) => handlePageSizeChange(Number(value))}
                  min={1}
                  max={locations.length}
                />
              )}
              <Pagination
                size="sm"
                total={chunkedLocations.length}
                value={page}
                onChange={setPage}
                mt="sm"
              />
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
};
