/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { Divider, Paper, Stack } from "@mantine/core";
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
import { ELoadingType, ENotificationType } from "@/stores/session/types";

const Panel: React.FC = () => {
  const provider = useMainStore((state) => state.provider);
  const category = useMainStore((state) => state.category);

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

  return (
    <>
      <Paper className={styles.panelWrapper}>
        <Stack gap="calc(var(--default-spacing) * 3)" px="xl" pb="xl" justify="center">
          <Header />
          <Divider size="md" label="Find a Collection" />
          <Filters />
          <Divider size="md" label="Refine your Search" />
          <ParameterSelect />
          <Geography />
          <DateSelect />
          <Controls />
        </Stack>
        <Loading desktop={false} />
      </Paper>
    </>
  );
};

export default Panel;
