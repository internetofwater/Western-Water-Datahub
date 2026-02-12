/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment } from "react";
import { Divider, Text, Title } from "@mantine/core";
import { Datasource } from "@/features/Panel/Datasources/Datasource";
import useMainStore from "@/stores/main";

export const Datasources: React.FC = () => {
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );

  return (
    <>
      <Title order={2} size="h3">
        Selected Data Sources
      </Title>
      {selectedCollections.length === 0 && (
        <Text size="sm" c="dimmed">
          Select at least one data source to continue.
        </Text>
      )}
      {selectedCollections.map((collectionId, index) => (
        <Fragment key={`parameter-select-${collectionId}`}>
          {index > 0 && <Divider my="var(--default-spacing)" />}
          <Datasource collectionId={collectionId} />
        </Fragment>
      ))}
    </>
  );
};
