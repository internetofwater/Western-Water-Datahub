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
} from "@mantine/core";
import Delete from "@/assets/Delete";
import Select from "@/components/Select";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import styles from "@/features/Panel/Panel.module.css";
import { Palette } from "@/features/Panel/Refine/Palette/Palette";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { MainState } from "@/stores/main/types";
import { CollectionType, getCollectionType } from "@/utils/collection";
import { getCategoryLabel } from "@/utils/label";
import { getParameterUnit } from "@/utils/parameters";

type Props = {
  collectionId: ICollection["id"];
};

const ParameterSelect: React.FC<Props> = (props) => {
  const { collectionId } = props;

  const collections = useMainStore((state) => state.collections);
  const parameterGroups = useMainStore((state) => state.parameterGroups);
  const categories = useMainStore((state) => state.categories);
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const parameters =
    useMainStore((state) => state.parameters).find(
      (parameter) => parameter.collectionId === collectionId,
    )?.parameters ?? [];
  const palette =
    useMainStore((state) => state.palettes).find(
      (palette) => palette.collectionId === collectionId,
    )?.palette ?? null;

  const addParameter = useMainStore((state) => state.addParameter);
  const removeParameter = useMainStore((state) => state.removeParameter);
  const hasParameter = useMainStore((state) => state.hasParameter);

  const removePalette = useMainStore((state) => state.removePalette);

  const [parameterLimit, setParameterLimit] = useState<number>();
  const [collectionType, setCollectionType] = useState(CollectionType.Unknown);
  const [localParameters, setLocalParameters] = useState(parameters);
  const [name, setName] = useState<string>("Parameters");
  const [data, setData] = useState<ComboboxData>([]);

  const [collectionLink, setCollectionLink] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [documentationLink, setDocumentationLink] = useState("");

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);

    if (!collection) {
      // TODO: show notification of error
      return;
    }

    const collectionType = getCollectionType(collection);
    setCollectionType(collectionType);

    if (collection.title) {
      setName(collection.title);
    }

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
        .flatMap((group) => group.members?.[collectionId])
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
    const restrictions = CollectionRestrictions[collectionId];

    if (restrictions && restrictions.length > 0) {
      const parameterLimitRestriction = restrictions.find(
        (restriction) => restriction.type === RestrictionType.Parameter,
      );

      if (parameterLimitRestriction && parameterLimitRestriction.count > 0) {
        setParameterLimit(parameterLimitRestriction.count);
      }
    }
  }, [collectionId]);

  useEffect(() => {
    for (const parameter of localParameters) {
      if (hasParameter(collectionId, parameter)) {
        removeParameter(collectionId, parameter);
      } else {
        addParameter(collectionId, parameter);
      }
    }

    parameters.forEach((parameter) => {
      if (
        !localParameters.includes(parameter) &&
        hasParameter(collectionId, parameter)
      ) {
        removeParameter(collectionId, parameter);
      }
    });
  }, [localParameters]);

  const showParameterSelect = (collectionId: ICollection["id"]) => {
    const collection = mainManager.getCollection(collectionId);

    if (collection) {
      const collectionType = getCollectionType(collection);

      return [CollectionType.EDR, CollectionType.EDRGrid].includes(
        collectionType,
      );
    }

    return false;
  };

  const showPalette = (collectionId: ICollection["id"]) => {
    const collection = mainManager.getCollection(collectionId);

    if (collection) {
      const collectionType = getCollectionType(collection);

      return CollectionType.EDRGrid === collectionType;
    }

    return false;
  };

  const handlePaletteClear = () => {
    removePalette(collectionId);
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

  return (
    <>
      {showParameterSelect(collectionId) && data.length > 0 ? (
        <Select
          size="sm"
          label={name}
          placeholder="Select..."
          data={data}
          value={localParameters}
          onChange={setLocalParameters}
          error={getParameterError()}
          description={getDescription(categories)}
          disabled={data.length === 0}
          withAsterisk={collectionType === CollectionType.EDRGrid}
          searchable
          multiple
          clearable
        />
      ) : (
        <Stack gap="var(--default-spacing)">
          <Text size="sm">{name}</Text>
          <Text size="xs" c="dimmed">
            This data source is not a timeseries dataset.
          </Text>
        </Stack>
      )}
      {showPalette(collectionId) && (
        <Group gap="var(--default-spacing)" mt="var(--default-spacing)">
          <Palette collectionId={collectionId} />
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
          <Fragment key={`pm-select-${collectionId}-link-${label}`}>
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
