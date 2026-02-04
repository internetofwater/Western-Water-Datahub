/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button, Group, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import CopyInput from "@/components/CopyInput";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Download/Download.module.css";
import { CollectionType } from "@/utils/collection";

type Props = {
  url: string;
  collectionType: CollectionType;
  isLoading: boolean;
  onGetAllCSV: () => void;
};

export const Header: React.FC<Props> = (props) => {
  const { url, collectionType, isLoading, onGetAllCSV } = props;

  const mobile = useMediaQuery("(max-width: 899px)");

  const getMessage = () => {
    switch (collectionType) {
      case CollectionType.EDR:
        return "This is the request used to fetch all locations displayed on the map. Select locations in the left-hand panel to interact with individual locations, and view the location's properties, download parameter data as a csv, or retrieve the request used to populate the chart.";
      case CollectionType.EDRGrid:
        return "This is the request used to fetch the initial CoverageJSON data, that is then parsed into a geospatial format to allow interactions on the map. Select grids in the left-hand panel to view paramater data, or retrieve the request that can be used to fetch data for just that grid area.";
      case CollectionType.Features:
        return "This is the request used to fetch all items displayed on the map.";
      default:
        return "This is the request used to fetch all locations displayed on the map. Select locations in the left-hand panel to interact with individual locations, and view the location's properties.";
    }
  };

  return (
    <>
      <Text size="xs" c="dimmed">
        {getMessage()}
      </Text>
      <Group justify="space-between" gap="var(--default-spacing)">
        <CopyInput
          size="sm"
          url={url}
          className={
            !mobile && collectionType === CollectionType.EDR
              ? styles.partialWidth
              : styles.fullWidth
          }
        />
        {collectionType === CollectionType.EDR && (
          <Tooltip
            label={
              isLoading
                ? "Please wait for download to finish."
                : `Download the parameter data for all selected locations in CSV format.`
            }
            multiline
          >
            <Button
              size="md"
              disabled={isLoading}
              data-disabled={isLoading}
              onClick={onGetAllCSV}
            >
              Get All CSV's
            </Button>
          </Tooltip>
        )}
      </Group>
    </>
  );
};
