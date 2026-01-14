/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title } from "@mantine/core";
import { Category } from "@/features/Panel/Filters/Category";
import { Collection } from "@/features/Panel/Filters/Collection";
import { Provider } from "./Provider";

const Filters: React.FC = () => {
  return (
    <>
      <Title order={2} size="h3">
        Find a Data Source
      </Title>
      <Stack pl="var(--default-spacing)" gap="calc(var(--default-spacing) * 2)">
        <Provider />
        <Category />
        <Collection />
      </Stack>
    </>
  );
};

export default Filters;
