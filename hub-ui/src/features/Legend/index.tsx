/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect } from 'react';
import { Box, Divider, Stack } from '@mantine/core';
import { Entry } from '@/features/Legend/Entry';
import styles from '@/features/Legend/Legend.module.css';
import mainManager from '@/managers/Main.init';
import useMainStore from '@/stores/main';
import { TLayer } from '@/stores/main/types';
import useSessionStore from '@/stores/session';
import { EOverlay } from '@/stores/session/types';

const Legend: React.FC = () => {
  const layers = useMainStore((state) => state.layers);

  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const handleColorChange = (color: TLayer['color'], layerId: TLayer['id']) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        color,
        layer.visible,
        layer.opacity,
        layer.paletteDefinition
      );
    }
  };

  const handleVisibilityChange = (visible: boolean, layerId: TLayer['id']) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        layer.color,
        visible,
        layer.opacity,
        layer.paletteDefinition
      );
    }
  };

  const handleOpacityChange = (opacity: number, layerId: TLayer['id']) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        layer.color,
        layer.visible,
        opacity,
        layer.paletteDefinition
      );
    }
  };

  useEffect(() => {
    if (overlay === EOverlay.Legend && layers.length === 0) {
      setOverlay(null);
    }
  });

  return (
    <Stack gap="var(--default-spacing)" className={`${styles.container} ${styles.legendWrapper}`}>
      <Box className={styles.legendContainer}>
        {layers.map((layer, index) => (
          <Fragment key={`legend-entry-${layer.id}`}>
            <Entry
              layer={layer}
              handleColorChange={handleColorChange}
              handleVisibilityChange={handleVisibilityChange}
              handleOpacityChange={handleOpacityChange}
            />
            {index < layers.length - 1 && <Divider />}
          </Fragment>
        ))}
      </Box>
    </Stack>
  );
};

export default Legend;
