/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Box, Divider, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Controls from "@/features/Panel/Controls";
import Filters from "@/features/Panel/Filters";
import { Header } from "@/features/Panel/Header";
import styles from "@/features/Panel/Panel.module.css";
import Refine from "@/features/Panel/Refine";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import {
  ELoadingType,
  ENotificationType,
  EOverlay,
} from "@/stores/session/types";

const Panel: React.FC = () => {
  const categories = useMainStore((state) => state.categories);
  const provider = useMainStore((state) => state.provider);
  const overlay = useSessionStore((state) => state.overlay);

  const mobile = useMediaQuery("(max-width: 899px)");

  const [isVisible, setIsVisible] = useState(true);

  const getCollections = async () => {
    const loadingInstance = loadingManager.add(
      "Updating data sources",
      ELoadingType.Collections,
    );
    try {
      await mainManager.getCollections();
      loadingManager.remove(loadingInstance);
      notificationManager.show(
        "Updated data sources",
        ENotificationType.Success,
      );
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
          10000,
        );
      }
      loadingManager.remove(loadingInstance);
    }
  };

  useEffect(() => {
    void getCollections();
  }, [provider, categories]);

  useEffect(() => {
    if (!mobile) {
      setIsVisible(true);
      return;
    }
    setIsVisible(overlay === EOverlay.Controls);
  }, [mobile, overlay]);

  return (
    <>
      {mobile && isVisible && <Box className={styles.panelUnderlay} />}
      <Box
        className={styles.panelWrapper}
        style={{ display: isVisible ? "block" : "none" }}
      >
        <Stack
          gap="calc(var(--default-spacing) * 1)"
          px="xl"
          py="xl"
          justify="center"
          className={styles.panelContent}
        >
          <Header />
          <Filters />
          <Divider size="md" />
          <Refine />
          <Controls />
        </Stack>
      </Box>
    </>
  );
};

export default Panel;
