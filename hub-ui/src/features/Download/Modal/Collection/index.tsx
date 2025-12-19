/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Fragment, useEffect, useState } from "react";
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
import styles from "@/features/Download/Download.module.css";
import { useLocations } from "@/hooks/useLocations";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { CollectionType, getCollectionType } from "@/utils/collection";
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
  const searches = useMainStore((state) => state.searches);

  const { selectedLocations: mapLocations, otherLocations } =
    useLocations(layer);

  const [collection, setCollection] = useState<ICollection>();
  const [collectionType, setCollectionType] = useState<CollectionType>(
    CollectionType.Unknown,
  );

  const [collectionLink, setCollectionLink] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [documentationLink, setDocumentationLink] = useState("");

  const [locations, setLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const search = searches.find(
      (search) => search.collectionId === layer.collectionId,
    );

    if (search) {
      setSearchTerm(search.searchTerm);
    }
  }, [searches]);

  useEffect(() => {
    if (linkLocation && linkLocation.collectionId === layer.collectionId) {
      setLocations([...locations, linkLocation.id]);
    }
  }, [linkLocation]);

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
      const collectionType = getCollectionType(collection);

      const collectionLink =
        collection.links.find(
          (link) => link.rel === "alternate" && link.type === "text/html",
        )?.href ?? "";
      const sourceLink =
        collection.links.find((link) => link.rel === "canonical")?.href ?? "";
      const documentationLink =
        collection.links.find((link) => link.rel === "documentation")?.href ??
        "";

      setCollectionLink(collectionLink);
      setSourceLink(sourceLink);
      setDocumentationLink(documentationLink);

      setCollectionType(collectionType);
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

  const links = [
    { label: "API", href: collectionLink, title: "This dataset in the API" },
    {
      label: "Source",
      href: sourceLink,
      title: "Original source of pre-transformed data",
    },
    {
      label: "Methodology",
      href: documentationLink,
      title: "The methodology of the original source data",
    },
  ].filter((link) => link.href?.length > 0);

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
        <Box p="var(--default-spacing)" className={styles.collectionWrapper}>
          <Group justify="space-between" mb="sm">
            <Title order={3}>{collection.title}</Title>
            <Group align="center" gap="var(--default-spacing)">
              {links.map(({ label, href, title }, index) => (
                <Fragment key={`${collection.id}-link-${label}`}>
                  {index > 0 && <Divider orientation="vertical" />}
                  <Anchor target="_blank" href={href} title={title}>
                    {label}
                  </Anchor>
                </Fragment>
              ))}
              <Button onClick={toggle} ml="calc(var(--default-spacing) * 2)">
                {opened ? "Hide" : "Show"}
              </Button>
            </Group>
          </Group>
          <Collapse in={opened}>
            <Divider />
            <Group w="100%" justify="space-between" align="flex-start" gap={0}>
              <Menu
                collectionId={layer.collectionId}
                collectionType={collectionType}
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
                linkLocation={linkLocation}
              />
              <LayerBlock
                layer={layer}
                collection={collection}
                collectionType={collectionType}
                locations={[
                  ...mapLocations.filter((feature) =>
                    locations.includes(getId(feature)),
                  ),
                  ...otherLocations.filter((feature) =>
                    locations.includes(getId(feature)),
                  ),
                ]}
                linkLocation={linkLocation}
              />
            </Group>
          </Collapse>
        </Box>
      )}
    </>
  );
};

export default Collection;
