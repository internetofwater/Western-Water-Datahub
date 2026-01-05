/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Slider, Text } from "@mantine/core";
import styles from "@/features/Legend/Legend.module.css";
import { TLayer } from "@/stores/main/types";

type Props = {
  id: TLayer["id"];
  opacity: TLayer["opacity"];
  handleOpacityChange: (
    opacity: TLayer["opacity"],
    layerId: TLayer["id"],
  ) => void;
};

export const OpacitySlider: React.FC<Props> = (props) => {
  const { id, opacity, handleOpacityChange } = props;

  return (
    <Box>
      <Text size="sm">Layer Opacity</Text>
      <Slider
        className={styles.opacitySlider}
        min={0}
        max={1}
        step={0.05}
        value={opacity}
        onChange={(value) => handleOpacityChange(value, id)}
        label={(value) => `${Math.round(value * 100)}%`}
      />
    </Box>
  );
};
