/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { ExpressionSpecification } from "mapbox-gl";
import { ColorInput, Group, Stack, Switch, Text } from "@mantine/core";
import { Grid } from "@/features/Legend/Grid";
import styles from "@/features/Legend/Legend.module.css";
import { OpacitySlider } from "@/features/Legend/OpacitySlider";
import { Shapes } from "@/features/Legend/Shapes";
import { DetailedGradient } from "@/features/Panel/Refine/Palette/DetailedGradient";
import mainManager from "@/managers/Main.init";
import { TLayer } from "@/stores/main/types";
import { CollectionType, getCollectionType } from "@/utils/collection";

type Props = {
  layer: TLayer;
  handleColorChange: (color: TLayer["color"], layerId: TLayer["id"]) => void;
  handleVisibilityChange: (visible: boolean, layerId: TLayer["id"]) => void;
  handleOpacityChange: (
    opacity: TLayer["opacity"],
    layerId: TLayer["id"],
  ) => void;
};

export const Entry: React.FC<Props> = (props) => {
  const {
    layer,
    handleColorChange,
    handleVisibilityChange,
    handleOpacityChange,
  } = props;

  const [collectionType, setCollectionType] = useState<CollectionType>(
    CollectionType.Unknown,
  );
  const [title, setTitle] = useState("");

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
      setTitle(collection?.title ?? "");
      const collectionType = getCollectionType(collection);
      setCollectionType(collectionType);
    }
  }, [layer]);

  const showColors = [
    CollectionType.EDR,
    CollectionType.EDRGrid,
    CollectionType.Features,
  ].includes(collectionType);
  const showShapes = [CollectionType.EDR, CollectionType.Features].includes(
    collectionType,
  );
  const showGrid = [CollectionType.EDRGrid].includes(collectionType);
  const showOpacity = [CollectionType.EDRGrid, CollectionType.Map].includes(
    collectionType,
  );

  return (
    <Stack w="100%" gap="xs" className={styles.legendEntry}>
      <Text size="lg" fw={700}>
        {title}
      </Text>
      {showOpacity && (
        <OpacitySlider
          id={layer.id}
          opacity={layer.opacity}
          handleOpacityChange={handleOpacityChange}
        />
      )}

      {layer.paletteDefinition && typeof layer.color !== "string" ? (
        <>
          <DetailedGradient
            collectionId={layer.collectionId}
            color={layer.color as ExpressionSpecification}
            paletteDefinition={layer.paletteDefinition}
          />
          <Switch
            size="lg"
            mb="calc(var(--default-spacing) / 2)"
            onLabel="VISIBLE"
            offLabel="HIDDEN"
            checked={layer.visible}
            onChange={(event) =>
              handleVisibilityChange(event.target.checked, layer.id)
            }
          />
        </>
      ) : (
        typeof layer.color === "string" && (
          <Group w="100%" justify="space-between" align="flex-start">
            <Stack justify="flex-start">
              {showColors && (
                <ColorInput
                  label={
                    <Text size="xs" mt={0}>
                      Symbol Color
                    </Text>
                  }
                  value={layer.color}
                  onChange={(color) => handleColorChange(color, layer.id)}
                  className={styles.colorPicker}
                />
              )}

              <Switch
                size="lg"
                mb="calc(var(--default-spacing) / 2)"
                onLabel="VISIBLE"
                offLabel="HIDDEN"
                checked={layer.visible}
                onChange={(event) =>
                  handleVisibilityChange(event.target.checked, layer.id)
                }
              />
            </Stack>
            {showShapes && (
              <Shapes color={layer.color} geometryTypes={layer.geometryTypes} />
            )}
            {showGrid && <Grid color={layer.color} />}
          </Group>
        )
      )}
    </Stack>
  );
};
