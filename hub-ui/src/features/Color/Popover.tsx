/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ComboboxData, ComboboxItem, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import Palette from '@/assets/Palette';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import PopoverComponent from '@/components/Popover';
import Select from '@/components/Select';
import { Variant } from '@/components/types';
import { Gradient } from '@/features/Panel/Layers/Layer/Color/Gradient';
import styles from '@/features/Panel/Panel.module.css';
import { Layer } from '@/stores/main/types';
import { createColorRange, isSamePalette, isValidPalette } from '@/utils/colors';
import {
  ColorBrewerIndex,
  FriendlyColorBrewerPalettes,
  getPaletteLabel,
  isValidColorBrewerIndex,
  validColorBrewerIndex,
} from '@/utils/colors/types';

// C:\Users\jsalman\source\ArizonaWaterObservatory\ui\src\features\Panel\Layers\Layer\Color\Popover.tsx

type Props = {
  paletteDefinition: Layer['paletteDefinition'];
  handleChange: (paletteDefinition: Layer['paletteDefinition']) => void;
  parameters: string[];
  parameterOptions: ComboboxData;
};

export const Popover: React.FC<Props> = (props) => {
  const { parameters, parameterOptions, paletteDefinition, handleChange } = props;

  const [show, setShow] = useState(false);

  const [palette, setPalette] = useState<FriendlyColorBrewerPalettes | null>(
    paletteDefinition?.palette ?? null
  );
  const [colors, setColors] = useState<string[]>([]);

  const [parameter, setParameter] = useState<string | null>(paletteDefinition?.parameter ?? null);
  const [count, setCount] = useState<ColorBrewerIndex | null>(paletteDefinition?.count ?? null);
  const [data, setData] = useState<ComboboxData>(
    parameterOptions.filter((option) => parameters.includes((option as ComboboxItem).value))
  );

  const [label, setLabel] = useState(paletteDefinition?.parameter ?? '');

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
    const data = parameterOptions.filter((option) =>
      parameters.includes((option as ComboboxItem).value)
    );

    setData(data);
  }, [parameterOptions, parameters]);

  useEffect(() => {
    if (!parameter || data.length === 0) {
      return;
    }

    const option = data.find((option) => (option as ComboboxItem).value === parameter);

    if (option) {
      setLabel((option as ComboboxItem).label);
    }
  }, [parameter, data]);

  useEffect(() => {
    setPalette(paletteDefinition?.palette ?? null);
    setParameter(paletteDefinition?.parameter ?? null);
    setCount(paletteDefinition?.count ?? null);
  }, [paletteDefinition]);

  const handleSave = () => {
    if (palette !== null && count !== null && parameter !== null) {
      handleChange({ palette, count, parameter, index: 0 });
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
      parameters.includes(parameter)
  );
  const noParameters = parameters.length === 0;

  return (
    <PopoverComponent
      opened={show}
      onChange={setShow}
      closeOnClickOutside={false}
      position="right-start"
      shadow="md"
      target={
        <Tooltip
          label={noParameters ? 'No parameters selected' : 'Create a dynamic visualization.'}
          disabled={show}
        >
          <IconButton
            disabled={noParameters}
            data-disabled={noParameters}
            variant={show ? Variant.Selected : Variant.Secondary}
            onClick={() => setShow(!show)}
          >
            <Palette />
          </IconButton>
        </Tooltip>
      }
      content={
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
                defaultValue={data.length > 0 ? (data[0] as ComboboxItem)?.value : undefined}
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
                data={Object.values(FriendlyColorBrewerPalettes).map((palette) => ({
                  value: palette,
                  label: getPaletteLabel(palette),
                }))}
                onChange={handlePaletteChange}
              />
            </Stack>
            {parameter && colors.length > 0 ? (
              <Gradient label={label} colors={colors} left="Less" right="More" />
            ) : (
              <Text size="xs">Please select parameter, count, and palette.</Text>
            )}
          </Group>
          <Group mt="md" justify="center">
            <Tooltip label="Invalid palette configuration." disabled={isValid}>
              <Button
                size="xs"
                disabled={!isValid}
                data-disabled={!isValid}
                variant={Variant.Primary}
                onClick={() => handleSave()}
              >
                Ok
              </Button>
            </Tooltip>
            <Tooltip label="Undo palette changes">
              <Button size="xs" variant={Variant.Tertiary} onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Tooltip>
          </Group>
          {count &&
            parameter &&
            palette &&
            isValidPalette({ count, parameter, palette, index: 1 }) &&
            !isSamePalette(
              { count, parameter, palette, index: paletteDefinition?.index || 0 },
              paletteDefinition
            ) && (
              <Text size="xs" c="red">
                Unsaved changes!
              </Text>
            )}
        </Stack>
      }
    />
  );
};
