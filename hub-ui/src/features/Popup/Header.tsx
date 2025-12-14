/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from "@mantine/core";
import { TLayer, TLocation } from "@/stores/main/types";
import { CollectionType } from "@/utils/collection";

type Props = {
  id: TLocation["id"];
  name: TLayer["name"];
  collectionType: CollectionType;
};

export const Header: React.FC<Props> = (props) => {
  const { id, name, collectionType } = props;

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
      <Text size="sm">{name}</Text>
    </Box>
  );
};
