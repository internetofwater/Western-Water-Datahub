/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Stack, Title, Tooltip, VisuallyHidden } from "@mantine/core";
import Info from "@/assets/Info";
import { Basin } from "@/features/Panel/Filters/Geography/Basin";
import { Region } from "@/features/Panel/Filters/Geography/Region";
import { State } from "@/features/Panel/Filters/Geography/State";
import styles from "@/features/Panel/Panel.module.css";

const Geography: React.FC = () => {
  const helpText =
    "Add a geographic filter to limit locations to a designated area";

  return (
    <Stack gap="xs" mb="xl">
      <Tooltip
        label={helpText}
        transitionProps={{ transition: "fade-right", duration: 300 }}
        position="top-start"
      >
        <Group className={styles.filterTitleWrapper} gap="xs" mb={-8}>
          <Title order={2} size="h3">
            Filter by Geography
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Region />
      <Basin />
      <State />
    </Stack>
  );
};

export default Geography;
