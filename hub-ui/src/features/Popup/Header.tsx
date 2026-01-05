/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature } from "geojson";
import { Box, Text } from "@mantine/core";
import { TLocation } from "@/stores/main/types";
import { CollectionType } from "@/utils/collection";

type Props = {
  id: TLocation["id"];
  name: string;
  feature: Feature | undefined;
  collectionType: CollectionType;
};

export const Header: React.FC<Props> = (props) => {
  const { id, name, feature, collectionType } = props;

  const getIdLabel = (collectionType: CollectionType) => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "Location Id";
      case CollectionType.EDRGrid:
        return "Grid Id";
      case CollectionType.Features:
        return "Item Id";
      default:
        return "Id";
    }
  };

  return (
    <Box>
      <Text size="lg" fw={700}>
        {getIdLabel(collectionType)}: {id}
      </Text>
      {feature && feature.geometry.type === "Point" && (
        <Text size="sm" c="dimmed">
          {feature.geometry.coordinates[0]}, {feature.geometry.coordinates[1]}
        </Text>
      )}
      <Text size="sm">{name}</Text>
    </Box>
  );
};
