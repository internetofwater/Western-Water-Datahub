/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Divider,
  Popover,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import LegendIcon from "@/assets/Legend";
import Tooltip from "@/components/Tooltip";
import { Entry } from "@/features/Legend/Entry";
import styles from "@/features/Legend/Legend.module.css";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";

const Legend: React.FC = () => {
  const layers = useMainStore((state) => state.layers);

  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const firstLayer = useRef(true);

  const [show, setShow] = useState(false);

  const handleColorChange = (color: TLayer["color"], layerId: TLayer["id"]) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        color,
        layer.visible,
        layer.opacity,
        layer.paletteDefinition,
      );
    }
  };

  const handleVisibilityChange = (visible: boolean, layerId: TLayer["id"]) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        layer.color,
        visible,
        layer.opacity,
        layer.paletteDefinition,
      );
    }
  };

  const handleOpacityChange = (opacity: number, layerId: TLayer["id"]) => {
    const layer = mainManager.getLayer({ layerId });

    if (layer) {
      void mainManager.updateLayer(
        layer,
        layer.color,
        layer.visible,
        opacity,
        layer.paletteDefinition,
      );
    }
  };

  const handleShow = (show: boolean) => {
    setOverlay(show ? EOverlay.Legend : null);
    setShow(show);
  };

  useEffect(() => {
    if (firstLayer.current && layers.length > 0) {
      firstLayer.current = false;
      setOverlay(EOverlay.Legend);
    }
  }, [layers]);

  useEffect(() => {
    if (overlay !== EOverlay.Legend) {
      setShow(false);
    } else {
      setShow(true);
    }
  }, [overlay]);

  return (
    <Popover
      opened={show}
      onChange={setShow}
      closeOnClickOutside={false}
      position="left-start"
      shadow="md"
    >
      <Popover.Target>
        <Tooltip label="Show legend" disabled={show}>
          <ActionIcon
            className={styles.legendButton}
            size="lg"
            onClick={() => handleShow(!show)}
          >
            <LegendIcon />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack
          gap="var(--default-spacing)"
          className={`${styles.container} ${styles.legendWrapper}`}
        >
          <Title order={3} className={styles.mapToolTitle}>
            Legend
          </Title>
          <Box className={styles.legendContainer}>
            {layers.length === 0 && <Text size="sm">No data visible</Text>}
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
      </Popover.Dropdown>
    </Popover>
  );
};

export default Legend;
