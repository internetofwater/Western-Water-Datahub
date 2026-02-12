/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect, useState } from "react";
import {
  ActionIcon,
  Anchor,
  ComboboxData,
  Divider,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import Delete from "@/assets/Delete";
import Info from "@/assets/Info";
import Select from "@/components/Select";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import styles from "@/features/Panel/Panel.module.css";
import { Palette } from "@/features/Panel/Refine/Palette/Palette";
import { showPalette, showParameterSelect } from "@/features/Panel/utils";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { MainState } from "@/stores/main/types";
import { CollectionType, getCollectionType } from "@/utils/collection";
import { getCategoryLabel } from "@/utils/label";
import { getParameterUnit } from "@/utils/parameters";

type Props = {
  collection: ICollection;
  onError: (hasError: boolean) => void;
};

const ParameterSelect: React.FC<Props> = (props) => {
  const { collection, onError } = props;

  const collections = useMainStore((state) => state.collections);
  const parameterGroups = useMainStore((state) => state.parameterGroups);
  const categories = useMainStore((state) => state.categories);
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const parameters =
    useMainStore((state) => state.parameters).find(
      (parameter) => parameter.collectionId === collection.id,
    )?.parameters ?? [];
  const palette =
    useMainStore((state) => state.palettes).find(
      (palette) => palette.collectionId === collection.id,
    )?.palette ?? null;

  const addParameter = useMainStore((state) => state.addParameter);
  const removeParameter = useMainStore((state) => state.removeParameter);
  const hasParameter = useMainStore((state) => state.hasParameter);

  const removePalette = useMainStore((state) => state.removePalette);

  const [parameterLimit, setParameterLimit] = useState<number>();
  const [collectionType, setCollectionType] = useState(CollectionType.Unknown);
  const [localParameters, setLocalParameters] = useState(parameters);
  const [data, setData] = useState<ComboboxData>([]);

  const [collectionLink, setCollectionLink] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [documentationLink, setDocumentationLink] = useState("");

  useEffect(() => {
    const collectionType = getCollectionType(collection);
    setCollectionType(collectionType);

    const collectionLink =
      collection.links.find(
        (link) => link.rel === "alternate" && link.type === "text/html",
      )?.href ?? "";
    const sourceLink =
      collection.links.find((link) => link.rel === "canonical")?.href ?? "";
    const documentationLink =
      collection.links.find((link) => link.rel === "documentation")?.href ?? "";

    setCollectionLink(collectionLink);
    setSourceLink(sourceLink);
    setDocumentationLink(documentationLink);

    const paramObjects = Object.values(collection?.parameter_names ?? {});

    let categoryFilter: string[] = [];
    if (categories.length > 0) {
      const validGroups = parameterGroups.filter((group) =>
        categories.includes(group.label),
      );

      categoryFilter = validGroups
        .flatMap((group) => group.members?.[collection.id])
        .filter(Boolean);
    }

    const data: ComboboxData = paramObjects
      .filter(
        (object) =>
          categoryFilter.length === 0 || categoryFilter.includes(object.id),
      )
      .map((object) => {
        const unit = getParameterUnit(object);

        return {
          collectionId: collection.id,
          label: `${object.name} (${unit})`,
          value: object.id,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    setData(data);
  }, [collections, selectedCollections, parameterGroups, categories]);

  useEffect(() => {
    const restrictions = CollectionRestrictions[collection.id];

    if (restrictions && restrictions.length > 0) {
      const parameterLimitRestriction = restrictions.find(
        (restriction) => restriction.type === RestrictionType.Parameter,
      );

      if (parameterLimitRestriction && parameterLimitRestriction.count > 0) {
        setParameterLimit(parameterLimitRestriction.count);
      }
    }
  }, [collection]);

  useEffect(() => {
    for (const parameter of localParameters) {
      if (hasParameter(collection.id, parameter)) {
        removeParameter(collection.id, parameter);
      } else {
        addParameter(collection.id, parameter);
      }
    }

    parameters.forEach((parameter) => {
      if (
        !localParameters.includes(parameter) &&
        hasParameter(collection.id, parameter)
      ) {
        removeParameter(collection.id, parameter);
      }
    });
  }, [localParameters]);

  const handlePaletteClear = () => {
    removePalette(collection.id);
  };

  const getDescription = (categories: MainState["categories"]) => {
    if (categories.length > 0) {
      return `Showing parameters within ${getCategoryLabel(categories.length)}: ${categories.join(", ")}`;
    }

    return null;
  };

  /**
   * This layer is a grid type which requires at least one selected parameter
   *
   * @constant
   */
  const isMissingParameters =
    collectionType === CollectionType.EDRGrid && localParameters.length === 0;
  /**
   * There is a parameter count limit on for this dataset and we have exceeded it
   *
   * @constant
   */
  const isParameterSelectionOverLimit = parameterLimit
    ? localParameters.length > parameterLimit
    : false;

  useEffect(() => {
    const hasError =
      (parameterLimit && isParameterSelectionOverLimit) || isMissingParameters;

    onError(hasError);
  }, [isMissingParameters, isParameterSelectionOverLimit]);

  const getParameterError = () => {
    if (parameterLimit && isParameterSelectionOverLimit) {
      return `Please remove ${localParameters.length - parameterLimit} parameter${localParameters.length - parameterLimit > 1 ? "s" : ""}`;
    }

    if (isMissingParameters) {
      return "Please select at least one parameter.";
    }

    return false;
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

  const helpText = (
    <>
      <Text size="sm">
        Parameters are scientific measurements, contained by data sources, that
        are associated with specific locations and times.
      </Text>
      <br />
      <Text size="sm">
        Selecting one or more parameters will show locations on the map that
        contain at least one measurement for that parameter.
      </Text>
    </>
  );

  return (
    <>
      {showParameterSelect(collection.id) && data.length > 0 ? (
        <Select
          size="sm"
          label={
            <Tooltip multiline label={helpText}>
              <Group
                className={styles.filterTitleWrapper}
                gap="calc(var(--default-spacing) / 2)"
              >
                <Text size="sm">Parameters</Text>
                <Info />
                {collectionType === CollectionType.EDRGrid && (
                  <Text size="sm" c="red">
                    *
                  </Text>
                )}
              </Group>
            </Tooltip>
          }
          placeholder="Select..."
          data={data}
          value={localParameters}
          onChange={setLocalParameters}
          error={getParameterError()}
          description={getDescription(categories)}
          disabled={data.length === 0}
          searchable
          multiple
          clearable
        />
      ) : (
        <Stack gap="var(--default-spacing)">
          <Text size="xs" c="dimmed">
            This data source is not a timeseries dataset.
          </Text>
        </Stack>
      )}
      {showPalette(collection.id) && (
        <Group gap="var(--default-spacing)" mt="var(--default-spacing)">
          <Palette collectionId={collection.id} />
          <ActionIcon
            disabled={!palette}
            data-disabled={!palette}
            onClick={handlePaletteClear}
            className={styles.actionButton}
            color="red-rocks"
          >
            <Delete />
          </ActionIcon>
        </Group>
      )}
      <Group
        align="center"
        gap="calc(var(--default-spacing) / 2)"
        mt="var(--default-spacing)"
      >
        {links.map(({ label, href, title }, index) => (
          <Fragment key={`pm-select-${collection.id}-link-${label}`}>
            {index > 0 && <Divider orientation="vertical" />}
            <Anchor size="xs" target="_blank" href={href} title={title}>
              {label}
            </Anchor>
          </Fragment>
        ))}
      </Group>
    </>
  );
};

export default ParameterSelect;
