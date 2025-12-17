/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { ActionIcon, ComboboxData, Group, Text } from '@mantine/core';
import Delete from '@/assets/Delete';
import Select from '@/components/Select';
import mainManager from '@/managers/Main.init';
import { ICollection } from '@/services/edr.service';
import useMainStore from '@/stores/main';
import { CollectionType, getCollectionType } from '@/utils/collection';
import { getParameterUnit } from '@/utils/parameters';
import { Palette } from '../Palette/Palette';

type Props = {
  collectionId: ICollection['id'];
};

const ParameterSelect: React.FC<Props> = (props) => {
  const { collectionId } = props;

  const collections = useMainStore((state) => state.collections);
  const selectedCollections = useMainStore((state) => state.selectedCollections);
  const parameters =
    useMainStore((state) => state.parameters).find(
      (parameter) => parameter.collectionId === collectionId
    )?.parameters ?? [];
  const palette =
    useMainStore((state) => state.palettes).find((palette) => palette.collectionId === collectionId)
      ?.palette ?? null;

  const addParameter = useMainStore((state) => state.addParameter);
  const removeParameter = useMainStore((state) => state.removeParameter);
  const hasParameter = useMainStore((state) => state.hasParameter);

  const removePalette = useMainStore((state) => state.removePalette);

  const [localParameters, setLocalParameters] = useState(parameters);
  const [name, setName] = useState<string>('Parameters');
  const [data, setData] = useState<ComboboxData>([]);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);

    if (!collection) {
      // TODO: show notification of error
      return;
    }

    if (collection.title) {
      setName(collection.title);
    }

    const paramObjects = Object.values(collection?.parameter_names ?? {});

    const data: ComboboxData = paramObjects
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
  }, [collections, selectedCollections]);

  useEffect(() => {
    for (const parameter of localParameters) {
      if (hasParameter(collectionId, parameter)) {
        removeParameter(collectionId, parameter);
      } else {
        addParameter(collectionId, parameter);
      }
    }

    parameters.forEach((parameter) => {
      if (!localParameters.includes(parameter) && hasParameter(collectionId, parameter)) {
        removeParameter(collectionId, parameter);
      }
    });
  }, [localParameters]);

  const showParameterSelect = (collectionId: ICollection['id']) => {
    const collection = mainManager.getCollection(collectionId);

    if (collection) {
      const collectionType = getCollectionType(collection);

      return [CollectionType.EDR, CollectionType.EDRGrid].includes(collectionType);
    }

    return false;
  };

  const showPalette = (collectionId: ICollection['id']) => {
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
          disabled={data.length === 0}
          searchable
          multiple
          clearable
        />
      ) : (
        <Text>This collection does not include parameters.</Text>
      )}
      {showPalette(collectionId) && (
        <Group
          gap="var(--default-spacing)"
          mt="var(--default-spacing)"
          mb="calc(var(--default-spacing) * 2)"
        >
          <Palette collectionId={collectionId} />
          <ActionIcon disabled={!palette} data-disabled={!palette} onClick={handlePaletteClear}>
            <Delete />
          </ActionIcon>
        </Group>
      )}
    </>
  );
};

export default ParameterSelect;
