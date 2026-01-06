/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Box, Divider, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Loading from "@/features/Loading";
import Controls from "@/features/Panel/Controls";
import { DateSelect } from "@/features/Panel/DateSelect";
import Filters from "@/features/Panel/Filters";
import Geography from "@/features/Panel/Filters/Geography";
import { Header } from "@/features/Panel/Header";
import styles from "@/features/Panel/Panel.module.css";
import ParameterSelect from "@/features/Panel/ParameterSelect";
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
  const provider = useMainStore((state) => state.provider);
  const category = useMainStore((state) => state.category);
  const overlay = useSessionStore((state) => state.overlay);

  const mobile = useMediaQuery("(max-width: 899px)");

  const [isVisible, setIsVisible] = useState(true);

  const getCollections = async () => {
    const loadingInstance = loadingManager.add(
      "Updating collections",
      ELoadingType.Collections,
    );
    try {
      await mainManager.getCollections();
      loadingManager.remove(loadingInstance);
      notificationManager.show(
        "Updated collections",
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
  }, [provider, category]);

  useEffect(() => {
    if (!mobile) {
      setIsVisible(true);
      return;
    }
    setIsVisible(overlay === EOverlay.Controls);
  }, [mobile, overlay]);

  return (
    <Box
      className={styles.panelWrapper}
      style={{ display: isVisible ? "block" : "none" }}
    >
      <Stack
        gap="calc(var(--default-spacing) * 3)"
        px="xl"
        py="xl"
        justify="center"
        className={styles.panelContent}
      >
        <Header />
        <Filters />
        <Divider />
        <ParameterSelect />
        <Geography />
        <DateSelect />
        <Controls />
      </Stack>
      <Loading desktop={false} />
    </Box>
  );
};

export default Panel;
