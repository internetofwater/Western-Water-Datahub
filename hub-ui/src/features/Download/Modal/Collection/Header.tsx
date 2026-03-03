/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Stack, Text } from "@mantine/core";
import Info from "@/assets/Info";
import CopyInput from "@/components/CopyInput";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Download/Download.module.css";
import { CollectionType } from "@/utils/collection";

type Props = {
  url: string;
  collectionType: CollectionType;
};

export const Header: React.FC<Props> = (props) => {
  const { url, collectionType } = props;

  const getMessage = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "This is the request used to fetch all locations displayed on the map.";
      case CollectionType.EDRGrid:
        return "This is the request used to fetch the initial CoverageJSON data, that is then parsed into a geospatial format to allow interactions on the map.";
      case CollectionType.Features:
        return "This is the request used to fetch all items displayed on the map.";
      default:
        return "This is the request used to fetch all locations displayed on the map.";
    }
  };

  const getTitle = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "Get All Location Geometries";
      case CollectionType.EDRGrid:
        return "Get All Coverage Data";
      case CollectionType.Features:
        return "Get All Item Geometries";
      default:
        return "Get All Data";
    }
  };

  return (
    <Tooltip label={getMessage()} multiline>
      <Stack gap="calc(var(--default-spacing) / 4)">
        <Group
          className={styles.getAllWrapper}
          gap="calc(var(--default-spacing) / 2)"
        >
          <Text size="md" fw={700}>
            {getTitle()}
          </Text>
          <Info />
        </Group>

        <Group justify="space-between" gap="var(--default-spacing)">
          <CopyInput size="sm" url={url} className={styles.fullWidth} />
        </Group>
      </Stack>
    </Tooltip>
  );
};
