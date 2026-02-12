/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Accordion, Stack, Title } from "@mantine/core";
import Filter from "@/assets/Filter";
import { Category } from "@/features/Panel/Filters/Category";
import { Provider } from "@/features/Panel/Filters/Provider";
import styles from "@/features/Panel/Panel.module.css";

const Filters: React.FC = () => {
  return (
    <Accordion defaultValue="filter" classNames={{ icon: styles.filterIcon }}>
      <Accordion.Item value="filter">
        <Accordion.Control icon={<Filter />}>
          <Title order={3} size="h4">
            Datasource Filters
          </Title>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="calc(var(--default-spacing) * 2)">
            <Provider />
            <Category />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default Filters;
