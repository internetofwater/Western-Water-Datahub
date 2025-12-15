/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColorInput, ComboboxData, Group } from '@mantine/core';
import { TColor, TLayer } from '@/stores/main/types';
import { CollectionType } from '@/utils/collection';
import { Popover } from './Popover';

type Props = {
  parameters: string[];
  parameterOptions: ComboboxData | undefined;
  paletteDefinition: TLayer['paletteDefinition'];
  handlePaletteDefinitionChange: (paletteDefinition: TLayer['paletteDefinition']) => void;
  color: TLayer['color'];
  handleColorChange: (color: TLayer['color']) => void;
  collectionType: CollectionType;
};

const Color: React.FC<Props> = (props) => {
  const {
    parameters,
    parameterOptions,
    paletteDefinition,
    handlePaletteDefinitionChange,
    color,
    handleColorChange,
    collectionType,
  } = props;

  const showPalette = collectionType === CollectionType.EDRGrid && parameterOptions;

  return (
    <Group w={showPalette ? '100%' : 'calc(50% - (var(--default-spacing) * 2))'} align="flex-end">
      <ColorInput
        size="xs"
        label="Symbol Color"
        w={showPalette ? 'calc(50% - (var(--default-spacing) * 2))' : '100%'}
        value={typeof color === 'string' && !paletteDefinition ? color : ''}
        onChange={(value) => handleColorChange(value as TColor)}
      />
      {collectionType === CollectionType.EDRGrid && parameterOptions && (
        <Popover
          parameters={parameters}
          parameterOptions={parameterOptions}
          paletteDefinition={paletteDefinition}
          handleChange={handlePaletteDefinitionChange}
        />
      )}
    </Group>
  );
};

export default Color;
