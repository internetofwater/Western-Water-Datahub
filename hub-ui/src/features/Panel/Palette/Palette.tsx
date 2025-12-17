/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  ComboboxData,
  ComboboxItem,
  Group,
  Popover,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Info from "@/assets/Info";
import PaletteIcon from "@/assets/Palette";
import Select from "@/components/Select";
import Tooltip from "@/components/Tooltip";
import { Gradient } from "@/features/Panel/Palette/Gradient";
import styles from "@/features/Panel/Panel.module.css";
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import {
  createColorRange,
  isSamePalette,
  isValidPalette,
} from "@/utils/colors";
import {
  ColorBrewerIndex,
  FriendlyColorBrewerPalettes,
  getPaletteLabel,
  isValidColorBrewerIndex,
  PaletteDefinition,
  validColorBrewerIndex,
} from "@/utils/colors/types";
import { getParameterUnit } from "@/utils/parameters";

type Props = {
  collectionId: ICollection["id"];
};

export const Palette: React.FC<Props> = (props) => {
  const { collectionId } = props;

  const addPalette = useMainStore((state) => state.addPalette);
  const collectionParameters = useMainStore((state) => state.parameters);
  const collectionPalettes = useMainStore((state) => state.palettes);

  const [show, setShow] = useState(false);

  const [palette, setPalette] = useState<FriendlyColorBrewerPalettes | null>(
    null,
  );
  const [colors, setColors] = useState<string[]>([]);

  const [parameter, setParameter] = useState<string | null>(null);
  const [parameters, setParameters] = useState<string[]>([]);
  const [paletteDefinition, setPaletteDefinition] =
    useState<PaletteDefinition | null>(null);
  const [count, setCount] = useState<ColorBrewerIndex | null>(null);
  const [data, setData] = useState<ComboboxData>([]);

  const [label, setLabel] = useState("");

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);

    const paramObjects = Object.values(collection?.parameter_names ?? {});

    const data = paramObjects
      .filter((object) => parameters.includes(object.id))
      .map((object) => {
        const unit = getParameterUnit(object);

        return {
          label: `${object.name} (${unit})`,
          value: object.id,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    setData(data);
  }, [collectionId, parameters]);

  useEffect(() => {
    const parameters =
      collectionParameters.find(
        (parameter) => parameter.collectionId === collectionId,
      )?.parameters ?? [];

    setParameters(parameters);
  }, [collectionParameters]);

  useEffect(() => {
    const paletteDefinition =
      collectionPalettes.find(
        (palette) => palette.collectionId === collectionId,
      )?.palette ?? null;

    setPaletteDefinition(paletteDefinition);
  }, [collectionPalettes]);

  useEffect(() => {
    if (count === null || palette === null) {
      return;
    }

    const colors = createColorRange(count, palette);
    setColors(colors);
  }, [count, palette]);

  useEffect(() => {
    if (parameters.length === 0) {
      setShow(false);
    }
  }, [parameters]);

  useEffect(() => {
    if (!parameter || data.length === 0) {
      return;
    }

    const option = data.find(
      (option) => (option as ComboboxItem).value === parameter,
    );

    if (option) {
      setLabel((option as ComboboxItem).label);
    }
  }, [parameter, data]);

  useEffect(() => {
    setPalette(paletteDefinition?.palette ?? null);
    setParameter(paletteDefinition?.parameter ?? null);
    setCount(paletteDefinition?.count ?? null);
    if (!paletteDefinition) {
      setColors([]);
    } else if (paletteDefinition.count && paletteDefinition.palette) {
      const colors = createColorRange(
        paletteDefinition.count,
        paletteDefinition.palette,
      );
      setColors(colors);
    }
  }, [paletteDefinition]);

  const handleSave = () => {
    if (palette !== null && count !== null && parameter !== null) {
      const paletteDefinition = { palette, count, parameter, index: 0 };
      addPalette(collectionId, paletteDefinition);
      setShow(false);
    }
  };

  const handleCancel = () => {
    setPalette(paletteDefinition?.palette ?? null);
    setParameter(paletteDefinition?.parameter ?? null);
    setCount(paletteDefinition?.count ?? null);
    setShow(false);
  };

  const handleGroupChange = (value: string | null) => {
    const count = Number(value);
    if (isValidColorBrewerIndex(count)) {
      setCount(count);
    }
  };

  const handleParameterChange = (value: string | null) => {
    if (value) {
      setParameter(value);
    }
  };

  const handlePaletteChange = (value: string | null) => {
    if (value) {
      setPalette(value as FriendlyColorBrewerPalettes);
    }
  };

  const isValid = Boolean(
    count &&
    parameter &&
    palette &&
    isValidPalette({ count, parameter, palette, index: 1 }) &&
    parameters.includes(parameter),
  );
  const noParameters = parameters.length === 0;

  return (
    <Popover
      opened={show}
      onChange={setShow}
      closeOnClickOutside={false}
      shadow="md"
    >
      <Group gap="var(--default-spacing)">
        <Tooltip
          multiline
          label={
            <Text size="sm">
              This collection supports visualization of a selected parameter.
              Configure the visualization in this menu and use the date selector
              on the map view different dates.
            </Text>
          }
          disabled={show}
        >
          <Group
            className={styles.filterTitleWrapper}
            gap="calc(var(--default-spacing) / 4)"
          >
            <Text size="sm" fw={700}>
              Dynamic Visualization
            </Text>
            <Info />
          </Group>
        </Tooltip>

        <Popover.Target>
          <Tooltip
            label={
              noParameters
                ? "No parameters selected"
                : "Create a dynamic visualization."
            }
            disabled={show}
          >
            <ActionIcon
              disabled={noParameters}
              data-disabled={noParameters}
              onClick={() => setShow(!show)}
            >
              <PaletteIcon />
            </ActionIcon>
          </Tooltip>
        </Popover.Target>
      </Group>
      <Popover.Dropdown>
        <Stack
          gap="var(--default-spacing)"
          maw="250px"
          className={styles.container}
          align="flex-start"
        >
          <Title order={5} size="h3">
            Color
          </Title>
          <Group>
            <Stack gap="var(--default-spacing)" w="100%">
              <Select
                size="xs"
                label="Groups"
                placeholder="Select the number of threshholds"
                defaultValue={String(validColorBrewerIndex[0])}
                value={String(count)}
                data={validColorBrewerIndex.map((index) => String(index))}
                onChange={handleGroupChange}
              />
              <Select
                size="xs"
                label="Parameters"
                placeholder="Select the parameter to visualize"
                defaultValue={
                  data.length > 0 ? (data[0] as ComboboxItem)?.value : undefined
                }
                value={parameter}
                data={data}
                onChange={handleParameterChange}
              />
              <Select
                size="xs"
                label="Palette"
                placeholder="Select the color palette to apply"
                defaultValue={Object.values(FriendlyColorBrewerPalettes)[0]}
                value={palette}
                data={Object.values(FriendlyColorBrewerPalettes).map(
                  (palette) => ({
                    value: palette,
                    label: getPaletteLabel(palette),
                  }),
                )}
                onChange={handlePaletteChange}
              />
            </Stack>
            {parameter && colors.length > 0 ? (
              <Gradient
                label={label}
                colors={colors}
                left="Less"
                right="More"
              />
            ) : (
              <Text size="xs">
                Please select parameter, count, and palette.
              </Text>
            )}
          </Group>
          <Group mt="md" justify="center">
            <Tooltip label="Invalid palette configuration." disabled={isValid}>
              <Button
                size="xs"
                disabled={!isValid}
                data-disabled={!isValid}
                onClick={() => handleSave()}
              >
                Ok
              </Button>
            </Tooltip>
            <Tooltip label="Undo palette changes">
              <Button size="xs" onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Tooltip>
          </Group>
          {count &&
            parameter &&
            palette &&
            isValidPalette({ count, parameter, palette, index: 1 }) &&
            !isSamePalette(
              {
                count,
                parameter,
                palette,
                index: paletteDefinition?.index || 0,
              },
              paletteDefinition,
            ) && (
              <Text size="xs" c="red">
                Unsaved changes!
              </Text>
            )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
