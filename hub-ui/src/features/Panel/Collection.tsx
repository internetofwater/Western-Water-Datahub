/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReactNode, useEffect, useState } from "react";
import {
  ComboboxData,
  Group,
  Loader,
  OptionsFilter,
  Radio,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import {
  ExtendedItem,
  getIcon,
  getOptions,
  renderOption,
} from "@/features/Panel/utils";
import { useLoading } from "@/hooks/useLoading";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { MainState } from "@/stores/main/types";
import { CollectionType, getCollectionType } from "@/utils/collection";
import { getCategoryLabel, getProviderLabel } from "@/utils/label";

const radios: Array<{ value: string; label: ReactNode }> = [
  { value: "all", label: "All" },
  {
    value: CollectionType.EDR,
    label: (
      <Group
        gap="calc(var(--default-spacing) / 2)"
        className={styles.datasourceOption}
        wrap="nowrap"
      >
        {getIcon(CollectionType.EDR)} Locations
      </Group>
    ),
  },
  {
    value: CollectionType.EDRGrid,
    label: (
      <Group
        gap="calc(var(--default-spacing) / 2)"
        className={styles.datasourceOption}
        wrap="nowrap"
      >
        {getIcon(CollectionType.EDRGrid)} Coverage
      </Group>
    ),
  },
  {
    value: CollectionType.Features,
    label: (
      <Group
        gap="calc(var(--default-spacing) / 2)"
        className={styles.datasourceOption}
        wrap="nowrap"
      >
        {getIcon(CollectionType.Features)} Features
      </Group>
    ),
  },
  {
    value: CollectionType.Map,
    label: (
      <Group
        gap="calc(var(--default-spacing) / 2)"
        className={styles.datasourceOption}
        wrap="nowrap"
      >
        {getIcon(CollectionType.Map)} Raster
      </Group>
    ),
  },
];

export const Collection: React.FC = () => {
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const setSelectedCollections = useMainStore(
    (state) => state.setSelectedCollections,
  );

  const layers = useMainStore((state) => state.layers);

  const provider = useMainStore((state) => state.provider);
  const categories = useMainStore((state) => state.categories);
  const collections = useMainStore((state) => state.collections);

  const [search, setSearch] = useState("");
  // const parameterGroups = useMainStore((state) => state.parameterGroups);

  const [collectionOptions, setCollectionOptions] = useState<ComboboxData>([]);
  const [collectionType, setCollectionType] = useState("all");

  const [filteredCollections, setFilteredCollections] = useState<string[]>([]);

  const { isFetchingCollections } = useLoading();

  useEffect(() => {
    const collectionOptions: ComboboxData = getOptions(collections);
    setCollectionOptions(collectionOptions);
  }, [collections]);

  useEffect(() => {
    if (collectionType === "all") {
      setFilteredCollections([]);
      return;
    }

    const filteredCollections = collections
      .filter((collection) => selectedCollections.includes(collection.id))
      .filter((collection) => getCollectionType(collection) !== collectionType)
      .map((collection) => collection.id);

    setFilteredCollections(filteredCollections);
  }, [collectionType]);

  useEffect(() => {
    for (const layer of layers) {
      if (!selectedCollections.includes(layer.collectionId)) {
        mainManager.deleteLayer(layer.collectionId);
      }
    }
  }, [selectedCollections]);

  const getDescription = (
    provider: MainState["provider"],
    categories: MainState["categories"],
  ) => {
    if (provider.length > 0 && categories.length > 0) {
      return `Showing data sources available from ${getProviderLabel(provider.length)}: ${provider.join(", ")}, in ${getCategoryLabel(categories.length)}: ${categories.join(", ")}`;
    } else if (provider.length > 0) {
      return `Showing data sources available from ${getProviderLabel(provider.length)}: ${provider.join(", ")}`;
    } else if (categories.length > 0) {
      return `Showing data sources available in ${getCategoryLabel(categories.length)}: ${categories.join(", ")}`;
    }

    return null;
  };

  const getValue = () => {
    if (
      collectionType === "all" &&
      provider.length === 0 &&
      categories.length === 0
    ) {
      return selectedCollections;
    }

    const currentCollections = collections
      .filter((collection) => getCollectionType(collection) === collectionType)
      .map((collection) => collection.id);

    return selectedCollections.filter((collectionId) =>
      currentCollections.includes(collectionId),
    );
  };

  const filter: OptionsFilter = ({ options }) => {
    const lowerSearch = search.toLowerCase();

    return (options as ExtendedItem[])
      .filter(
        (option) => collectionType === "all" || option.type === collectionType,
      )
      .filter(
        (option) =>
          lowerSearch.length === 0 ||
          option.label.toLowerCase().includes(lowerSearch),
      );
  };

  const handleChange = (e: string[]) => {
    // Prevent duplicates
    const selectedCollections = Array.from(
      new Set([...e, ...filteredCollections]),
    );

    setSelectedCollections(selectedCollections);
  };

  const handleSearchChange = (search: string) => setSearch(search);

  const helpText = (
    <>
      <Text size="sm">Select a data source to add locations from.</Text>
      <br />
      <Text size="sm">
        Locations connect scientific measurements to a geographic point on the
        map.
      </Text>
    </>
  );

  return (
    <Stack gap={0} className={styles.selectStack}>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
        label={
          // TODO: add asterisk
          <Tooltip multiline label={helpText}>
            <Group
              className={styles.filterTitleWrapper}
              gap="calc(var(--default-spacing) / 2)"
            >
              <Title order={3} size="h4">
                Select a Data Source
              </Title>
              <Info />
              <Text size="sm" c="red">
                *
              </Text>
            </Group>
          </Tooltip>
        }
        multiple
        description={getDescription(provider, categories)}
        placeholder="Select..."
        renderOption={renderOption}
        filter={filter}
        data={collectionOptions}
        value={getValue()}
        onChange={(e: string[]) => handleChange(e)}
        onSearchChange={handleSearchChange}
        disabled={isFetchingCollections}
        hidePickedOptions
        searchable
      />
      <Radio.Group
        size="xs"
        value={collectionType}
        onChange={setCollectionType}
      >
        <Group mt="xs" gap="calc(var(--default-spacing) * 2)">
          {radios.map(({ value, label }) => (
            <Radio
              key={`radio-${value}`}
              classNames={{
                body: styles.radioBody,
                label: styles.radioLabel,
              }}
              value={value}
              label={label}
            />
          ))}
        </Group>
      </Radio.Group>
      {isFetchingCollections && (
        <Group>
          <Loader color="blue" type="dots" />
          <Text size="sm">Updating Data Source(s)</Text>
        </Group>
      )}
    </Stack>
  );
};
