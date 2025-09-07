/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button } from "@mantine/core";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { NotificationType } from "@/stores/session/types";

export const UpdateCollectionsButton: React.FC = () => {
  const addData = async () => {
    const instance = loadingManager.add("Fetching Collections");
    // TODO: remove this, temporary for development
    mainManager.addCollection({
      id: "rise-edr",
    });

    mainManager.updateCollections();
    loadingManager.remove(instance);
    notificationManager.show("Done fetching data", NotificationType.Success);
  };

  return <Button onClick={() => void addData()}>Update Data</Button>;
};
