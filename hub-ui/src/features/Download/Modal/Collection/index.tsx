/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState } from "react";
import { Feature } from "geojson";
import {
  Anchor,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { StringIdentifierCollections } from "@/consts/collections";
import { useLocations } from "@/hooks/useLocations";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import { TLayer } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { getIdStore } from "@/utils/getIdStore";
import { hasSearchTerm } from "@/utils/searchFeatures";
import { LayerBlock } from "./LayerBlock";
import { Menu } from "./Menu";

dayjs.extend(isSameOrBefore);

type Props = {
  layer: TLayer;
  open?: boolean;
};

const Collection: React.FC<Props> = (props) => {
  const { layer, open = false } = props;

  const [opened, { toggle }] = useDisclosure(open);

  const linkLocation = useSessionStore((state) => state.linkLocation);

  const { selectedLocations: mapLocations, otherLocations } =
    useLocations(layer);

  const [collection, setCollection] = useState<ICollection>();

  const [locations, setLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (linkLocation && linkLocation.collectionId === layer.collectionId) {
      setLocations([...locations, linkLocation.id]);
    }
  }, [linkLocation]);

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
      setCollection(collection);
    }
  }, [layer.collectionId]);

  const addLocation = (locationId: string) => {
    if (!locations.some((location) => location === locationId)) {
      setLocations([...locations, locationId]);
    }
  };

  const removeLocation = (locationId: string) => {
    const filteredLocations = locations.filter(
      (location) => location !== locationId,
    );
    setLocations(filteredLocations);
  };

  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleClear = () => {
    setLocations([]);
  };

  const alternateLink = collection?.links?.find(
    (link) => link.rel === "alternate" && link.type === "text/html",
  )?.href;

  const isStringIdentifierCollection = StringIdentifierCollections.includes(
    layer.collectionId,
  );

  const getId = (feature: Feature) => {
    if (isStringIdentifierCollection) {
      return getIdStore(feature) ?? String(feature.id);
    }

    return String(feature.id);
  };

  return (
    <>
      {collection && (
        <Box p="var(--default-spacing)">
          <Group justify="space-between" mb="sm">
            {alternateLink ? (
              <Anchor href={alternateLink} target="_blank">
                <Title order={3}>{collection.title}</Title>
              </Anchor>
            ) : (
              <Title order={3}>{collection.title}</Title>
            )}
            <Button onClick={toggle}>{opened ? "Hide" : "Show"}</Button>
          </Group>
          <Collapse in={opened}>
            <Divider />
            <Group w="100%" justify="space-between" align="flex-start" gap={0}>
              <Menu
                collectionId={layer.collectionId}
                mapLocations={mapLocations
                  .filter((feature) => hasSearchTerm(searchTerm, feature))
                  .map((feature) => getId(feature))}
                otherLocations={otherLocations
                  .filter((feature) => hasSearchTerm(searchTerm, feature))
                  .map((feature) => getId(feature))}
                selectedLocations={locations}
                addLocation={addLocation}
                removeLocation={removeLocation}
                searchTerm={searchTerm}
                onSearchTermChange={handleSearchTermChange}
                onClear={handleClear}
              />
              <LayerBlock
                layer={layer}
                locations={[
                  ...mapLocations.filter((feature) =>
                    locations.includes(getId(feature)),
                  ),
                  ...otherLocations.filter((feature) =>
                    locations.includes(getId(feature)),
                  ),
                ]}
              />
            </Group>
          </Collapse>
        </Box>
      )}
    </>
  );
};

export default Collection;
