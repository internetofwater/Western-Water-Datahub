/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from "@mantine/core";
import Geography from "@/features/Panel/Filters/Geography";
import { DateSelect } from "@/features/Panel/Refine/DateSelect";

const Refine: React.FC = () => {
  return (
    <>
      <Title order={2} size="h3">
        Refine your Search
      </Title>
      <Stack pl="var(--default-spacing)" gap="calc(var(--default-spacing) * 2)">
        <Geography />
        <DateSelect />
      </Stack>
    </>
  );
};

export default Refine;
