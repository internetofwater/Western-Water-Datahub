/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from "@mantine/core";
import { Basin } from "./Basin";
import { Region } from "./Region";
import { State } from "./State";

const Location: React.FC = () => {
  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Location
      </Title>
      <Region />
      <Basin />
      <State />
    </Stack>
  );
};

export default Location;
