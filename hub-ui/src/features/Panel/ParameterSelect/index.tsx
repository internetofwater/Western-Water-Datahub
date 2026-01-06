/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment } from "react";
import {
  Divider,
  Group,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import ParameterSelect from "@/features/Panel/ParameterSelect/ParameterSelect";
import useMainStore from "@/stores/main";

const ParameterSelectWrapper: React.FC = () => {
  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );

  const helpText = (
    <>
      <Text size="sm">
        Parameters are scientific measurements contained by collections that are
        associated with specific locations and times.
      </Text>
      <br />
      <Text size="sm">
        Selecting one or more parameters will show locations on the map that
        contain at least one measurement for that parameter.
      </Text>
    </>
  );

  return (
    <Stack gap={0} className={styles.selectStack}>
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h4">
            Filter by Parameter
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      {selectedCollections.length > 0 ? (
        selectedCollections.map((collectionId, index) => (
          <Fragment key={`parameter-select-${collectionId}`}>
            {index > 0 && <Divider my="var(--default-spacing)" />}
            <ParameterSelect collectionId={collectionId} />
          </Fragment>
        ))
      ) : (
        <Text size="sm" c="dimmed">
          Select at least one collection to show parameter selects.
        </Text>
      )}
    </Stack>
  );
};

export default ParameterSelectWrapper;
