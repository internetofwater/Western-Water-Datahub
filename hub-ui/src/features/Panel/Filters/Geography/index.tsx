/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from "@mantine/core";
import { Basin } from "@/features/Panel/Filters/Geography/Basin";
import { Region } from "@/features/Panel/Filters/Geography/Region";
import { State } from "@/features/Panel/Filters/Geography/State";

const Geography: React.FC = () => {
  return (
    <Stack gap="xs">
      <Title order={2} size="h3" mb={-8}>
        Filter by Geography
      </Title>
      <Region />
      <Basin />
      <State />
    </Stack>
  );
};

export default Geography;
