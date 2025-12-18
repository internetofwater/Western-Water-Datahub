/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Group, Text } from "@mantine/core";
import styles from "@/features/Order/Order.module.css";
import mainManager from "@/managers/Main.init";
import { TLayer } from "@/stores/main/types";
import { Control } from "./Control";

type Props = {
  layer: TLayer;
};

export const Entry: React.FC<Props> = (props) => {
  const { layer } = props;

  const [title, setTitle] = useState("");

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection && collection?.title) {
      setTitle(collection.title);
    }
  }, [layer]);

  return (
    <Group justify="space-between" className={styles.entry}>
      <Text size="sm" fw={700} lineClamp={1} title={title} maw="85%">
        {title}
      </Text>
      <Control layer={layer} />
    </Group>
  );
};
