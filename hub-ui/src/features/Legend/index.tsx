/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect } from "react";
import { ColorInput, Divider, Group, Stack, Switch, Text } from "@mantine/core";
import { useMap } from "@/contexts/MapContexts";
import styles from "@/features/Legend/Legend.module.css";
import { MAP_ID } from "@/features/Map/config";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { SessionState } from "@/stores/session/types";

const Legend: React.FC = () => {
  const { map } = useMap(MAP_ID);

  const legendEntries = useSessionStore((state) => state.legendEntries);
  const setLegendEntries = useSessionStore((state) => state.setLegendEntries);

  const originalCollections = useMainStore(
    (state) => state.originalCollections,
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on("styledata", () => {
      const originalCollections = useMainStore.getState().originalCollections;
      const legendEntries = useSessionStore.getState().legendEntries;

      const layers = map.getStyle().layers;
      const newLegendEntries: SessionState["legendEntries"] = [];

      layers.forEach((layer) => {
        if (
          layer.type === "circle" &&
          originalCollections.some((collection) =>
            Object.values(
              mainManager.getLocationsLayerIds(collection.id),
            ).includes(layer.id),
          ) &&
          layer.paint
        ) {
          const collection = originalCollections.find((collection) =>
            Object.values(
              mainManager.getLocationsLayerIds(collection.id),
            ).includes(layer.id),
          );
          const color = layer.paint["circle-color"];
          if (collection && typeof color === "string") {
            newLegendEntries.push({
              collectionId: collection.id,
              color: color ?? "#000",
              visible:
                legendEntries.find(
                  (entry) => entry.collectionId === collection.id,
                )?.visible ?? true,
            });
          }
        }
      });

      useSessionStore.getState().setLegendEntries(newLegendEntries);
    });
  }, [map]);

  const getCollectionTitle = (collectionId: string) => {
    const collection = originalCollections.find(
      (collection) => collection.id === collectionId,
    );

    return collection?.title ?? collectionId;
  };
  const handleColorChange = (color: string, collectionId: string) => {
    const { pointLayerId, lineLayerId, fillLayerId } =
      mainManager.getLocationsLayerIds(collectionId);
    if (map) {
      map.setPaintProperty(pointLayerId, "circle-color", color);
      map.setPaintProperty(lineLayerId, "line-color", color);
      map.setPaintProperty(fillLayerId, "fill-color", color);
    }

    const oldEntry = legendEntries.filter(
      (entry) => entry.collectionId === collectionId,
    )[0];
    const newLegendEntries = legendEntries.filter(
      (entry) => entry.collectionId !== collectionId,
    );

    setLegendEntries([
      ...newLegendEntries,
      {
        collectionId,
        color,
        visible: oldEntry.visible,
      },
    ]);
  };

  const handleVisibilityChange = (visible: boolean, collectionId: string) => {
    const oldEntry = legendEntries.filter(
      (entry) => entry.collectionId === collectionId,
    )[0];
    const newLegendEntries = legendEntries.filter(
      (entry) => entry.collectionId !== collectionId,
    );

    setLegendEntries([
      ...newLegendEntries,
      {
        collectionId,
        color: oldEntry.color,
        visible,
      },
    ]);
    const { pointLayerId, lineLayerId, fillLayerId } =
      mainManager.getLocationsLayerIds(collectionId);
    if (map) {
      [pointLayerId, lineLayerId, fillLayerId].forEach((layerId) =>
        map.setLayoutProperty(
          layerId,
          "visibility",
          visible ? "visible" : "none",
        ),
      );
    }
  };

  return (
    <Stack>
      {legendEntries
        .sort((a, b) => a.collectionId.localeCompare(b.collectionId))
        .map((entry, index) => (
          <Fragment key={`legend-entry-${entry.collectionId}`}>
            <Stack>
              <Text>{getCollectionTitle(entry.collectionId)}</Text>
              <Group justify="space-between" align="flex-end">
                <ColorInput
                  label="Locations"
                  value={entry.color}
                  onChange={(color) =>
                    handleColorChange(color, entry.collectionId)
                  }
                  className={styles.colorPicker}
                />
                <Switch
                  size="lg"
                  onLabel="ON"
                  offLabel="OFF"
                  checked={entry.visible}
                  onChange={(event) =>
                    handleVisibilityChange(
                      event.target.checked,
                      entry.collectionId,
                    )
                  }
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
