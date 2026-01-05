/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ActionIcon, Stack } from "@mantine/core";
import CircleDown from "@/assets/CircleDown";
import CircleUp from "@/assets/CircleUp";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Order/Order.module.css";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";

type Props = {
  layer: TLayer;
};
export const Control: React.FC<Props> = (props) => {
  const { layer } = props;

  const length = useMainStore((state) => state.layers).length;
  const updateLayerPosition = useMainStore(
    (state) => state.updateLayerPosition,
  );

  const handlePositionChange = (position: number) => {
    if (position > 0 && position < length + 1) {
      updateLayerPosition(layer.id, position);
      mainManager.reorderLayers();
    }
  };

  const disableUp = layer.position === 1;
  const disableDown = layer.position === length;

  return (
    <Stack gap="calc(var(--default-spacing) / 2)" my="var(--default-spacing)">
      <Tooltip
        label={
          disableUp
            ? "This layer is drawn on top of all layers."
            : "Move this layer up, drawing it above the layers below."
        }
        openDelay={500}
      >
        <ActionIcon
          disabled={disableUp}
          data-disabled={disableUp}
          variant="transparent"
          title="Move layer up"
          classNames={{ root: styles.actionIconRoot, icon: styles.actionIcon }}
          onClick={() => handlePositionChange(layer.position - 1)}
        >
          <CircleUp />
        </ActionIcon>
      </Tooltip>
      <Tooltip
        label={
          disableDown
            ? "This layer is drawn on bottom of all layers."
            : "Move this layer down, drawing it below the layers above."
        }
        openDelay={500}
      >
        <ActionIcon
          variant="transparent"
          title="Move layer down"
          disabled={disableDown}
          data-disabled={disableDown}
          classNames={{ root: styles.actionIconRoot, icon: styles.actionIcon }}
          onClick={() => handlePositionChange(layer.position + 1)}
        >
          <CircleDown />
        </ActionIcon>
      </Tooltip>
    </Stack>
  );
};
