/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Feature } from "geojson";
import { Group, NumberInput, Pagination, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { StringIdentifierCollections } from "@/consts/collections";
import styles from "@/features/Download/Download.module.css";
import { Grid } from "@/features/Download/Modal/Collection/Grid";
import { Header } from "@/features/Download/Modal/Collection/Header";
import { Item } from "@/features/Download/Modal/Collection/Item";
import { Location } from "@/features/Download/Modal/Collection/Location";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { ICollection } from "@/services/edr.service";
import { TLayer, TLocation } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { chunk } from "@/utils/chunk";
import { CollectionType } from "@/utils/collection";
import { createEmptyCsv } from "@/utils/csv";
import { getIdStore } from "@/utils/getLabel";
import {
  buildCubeUrl,
  buildItemsUrl,
  buildLocationsUrl,
  buildLocationUrl,
} from "@/utils/url";

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

  const [isLoading, setIsLoading] = useState(false);
  const locationRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const mobile = useMediaQuery("(max-width: 899px)");

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setPage(1);
  };

  const isStringIdentifierCollection = StringIdentifierCollections.includes(
    layer.collectionId,
  );

  const getId = (feature: Feature) => {
    if (isStringIdentifierCollection) {
      return getIdStore(feature) ?? String(feature.id);
    }

    return String(feature.id);
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

  const getFileName = (locationId: string) => {
    let name = `data-${locationId}-${layer.parameters.join("_")}`;

    if (layer.from && dayjs(layer.from).isValid()) {
      name += `-${dayjs(layer.from).format("MM/DD/YYYY")}`;
    }

    if (layer.to && dayjs(layer.to).isValid()) {
      name += `-${dayjs(layer.to).format("MM/DD/YYYY")}`;
    }

    return `${name}.csv`;
  };

  const handleGetAllCSV = async () => {
    setIsLoading(true);

    const promises = locations.map((feature) => getCSV(getId(feature)));

    await Promise.all(promises);

    if (isMounted.current) {
      notificationManager.show(
        "All CSV's generated",
        ENotificationType.Success,
        10000,
      );

      setIsLoading(false);
    }
  };

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

  const getCSV = async (locationId: string) => {
    if (!collection) {
      return;
    }

    const url = buildLocationUrl(
      collection.id,
      locationId,
      layer.parameters,
      layer.from,
      layer.to,
      true,
      true,
    );

    const loadingInstance = loadingManager.add(
      `Generating csv for ${getLabel()}: ${locationId}`,
      ELoadingType.Data,
    );
    try {
      setIsLoading(true);

      if (!controller.current) {
        controller.current = new AbortController();
      }

      const res = await fetch(url, {
        signal: controller.current.signal,
      });

      if (!res.ok) {
        throw new Error(
          `Error: ${res.statusText.length > 0 ? res.statusText : "Unknown error"}`,
        );
      }

      let objectUrl = "";
      if (res.status === 204) {
        notificationManager.show(
          `No data found for ${getLabel()}: ${locationId} with the current parameter and date range selection.`,
          ENotificationType.Error,
          10000,
        );
        objectUrl = createEmptyCsv();
      } else {
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = getFileName(locationId);
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(objectUrl);
      a.remove();
      notificationManager.show(
        `CSV generated successfully for ${getLabel()}: ${locationId}.`,
        ENotificationType.Success,
        10000,
      );
    } catch (err) {
      if (((err as Error)?.message ?? "").length > 0) {
        notificationManager.show(
          (err as Error)?.message,
          ENotificationType.Error,
          10000,
        );
      } else if (typeof err === "string") {
        notificationManager.show(err, ENotificationType.Error, 10000);
      }
    } finally {
      loadingManager.remove(loadingInstance);
    }
  };

  return (
    <Stack
      component="section"
      gap="var(--default-spacing)"
      className={styles.locationBlockWrapper}
    >
      <Header
        url={url}
        isLoading={isLoading}
        collectionType={collectionType}
        onGetAllCSV={handleGetAllCSV}
      />
      {currentChunk.length === 0 && (
        <Text fw={700} m="auto">
          Select {getLabel()}s from the menu {mobile ? "above" : "on the left"}
        </Text>
      )}
      {collection &&
        collectionType === CollectionType.EDR &&
        currentChunk.map((location) => (
          <Location
            key={`selected-location-${layer.id}-${location.id}`}
            // ref={(el) => {
            //   locationRefs.current[String(location.id)] = el;
            // }}
            linkLocation={linkLocation}
            location={location}
            layer={layer}
            collection={collection}
          />
        ))}
      {collection &&
        collectionType === CollectionType.EDRGrid &&
        currentChunk.map((location) => (
          <Grid
            key={`selected-grid-${layer.id}-${location.id}`}
            // ref={(el) => {
            //   locationRefs.current[String(location.id)] = el;
            // }}
            linkLocation={linkLocation}
            location={location}
            layer={layer}
            collection={collection}
          />
        ))}
      {collection &&
        collectionType === CollectionType.Features &&
        currentChunk.map((location) => (
          <Item
            key={`selected-item-${layer.id}-${location.id}`}
            // ref={(el) => {
            //   locationRefs.current[String(location.id)] = el;
            // }}
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
  );
};
