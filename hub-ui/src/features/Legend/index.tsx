/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect } from 'react';
import { ColorInput, Divider, Group, Stack, Switch, Text } from '@mantine/core';
import { useMap } from '@/contexts/MapContexts';
import styles from '@/features/Legend/Legend.module.css';
import { MAP_ID } from '@/features/Map/config';
import mainManager from '@/managers/Main.init';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { SessionState } from '@/stores/session/types';

const Legend: React.FC = () => {
  const { map } = useMap(MAP_ID);

  const legendEntries = useSessionStore((state) => state.legendEntries);
  const setLegendEntries = useSessionStore((state) => state.setLegendEntries);

  const originalCollections = useMainStore((state) => state.originalCollections);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on('styledata', () => {
      const originalCollections = useMainStore.getState().originalCollections;
      const legendEntries = useSessionStore.getState().legendEntries;

      const layers = map.getStyle().layers;
      const newLegendEntries: SessionState['legendEntries'] = [];
      layers.forEach((layer) => {
        if (
          layer.type === 'circle' &&
          originalCollections.some(
            (collection) => mainManager.getLocationsLayerId(collection.id) === layer.id
          ) &&
          layer.paint
        ) {
          const color = layer.paint['circle-color'];
          if (typeof color === 'string') {
            newLegendEntries.push({
              layerId: layer.id,
              color: color ?? '#000',
              visible: legendEntries.find((entry) => entry.layerId === layer.id)?.visible ?? true,
            });
          }
        }
      });
      useSessionStore.getState().setLegendEntries(newLegendEntries);
    });
  }, [map]);

  const getCollectionTitle = (layerId: string) => {
    const collection = originalCollections.find(
      (collection) => mainManager.getLocationsLayerId(collection.id) === layerId
    );

    return collection?.title ?? layerId;
  };
  const handleColorChange = (color: string, layerId: string) => {
    if (map) {
      map.setPaintProperty(layerId, 'circle-color', color);
    }

    const oldEntry = legendEntries.filter((entry) => entry.layerId === layerId)[0];
    const newLegendEntries = legendEntries.filter((entry) => entry.layerId !== layerId);

    setLegendEntries([
      ...newLegendEntries,
      {
        layerId,
        color,
        visible: oldEntry.visible,
      },
    ]);
  };

  const handleVisibilityChange = (visible: boolean, layerId: string) => {
    if (map) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }

    const oldEntry = legendEntries.filter((entry) => entry.layerId === layerId)[0];
    const newLegendEntries = legendEntries.filter((entry) => entry.layerId !== layerId);

    setLegendEntries([
      ...newLegendEntries,
      {
        layerId,
        color: oldEntry.color,
        visible,
      },
    ]);
  };

  return (
    <Stack>
      {legendEntries
        .sort((a, b) => a.layerId.localeCompare(b.layerId))
        .map((entry, index) => (
          <Fragment key={`legend-entry-${entry.layerId}`}>
            <Stack>
              <Text>{getCollectionTitle(entry.layerId)}</Text>
              <Group justify="space-between" align="flex-end">
                <ColorInput
                  label="Location Points"
                  value={entry.color}
                  onChange={(color) => handleColorChange(color, entry.layerId)}
                  className={styles.colorPicker}
                />
                <Switch
                  size="lg"
                  onLabel="ON"
                  offLabel="OFF"
                  checked={entry.visible}
                  onChange={(event) => handleVisibilityChange(event.target.checked, entry.layerId)}
                />
              </Group>
            </Stack>
            {index < legendEntries.length - 1 && <Divider />}
          </Fragment>
        ))}
    </Stack>
  );
};

export default Legend;
