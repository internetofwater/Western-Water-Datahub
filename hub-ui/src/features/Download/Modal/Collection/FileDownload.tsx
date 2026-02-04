/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Popover,
  Text,
  Tooltip,
} from "@mantine/core";
import DownloadIcon from "@/assets/Download";
import styles from "@/features/Download/Download.module.css";
import { ICollection } from "@/services/edr.service";
import { buildItemsUrl } from "@/utils/url";

type Props = {
  collectionId: ICollection["id"];
};

export const FileDownload: React.FC<Props> = (props) => {
  const { collectionId } = props;

  const [show, setShow] = useState(false);

  const handleDownload = (format: "kml" | "shp") => {
    const url = buildItemsUrl(collectionId, format);
    const anchor = document.createElement("a");
    anchor.href = url.toString();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setShow(false);
  };

  return (
    <Popover
      opened={show}
      onChange={setShow}
      offset={-5}
      withArrow
      classNames={{ dropdown: styles.downloadDropdown }}
    >
      <Popover.Target>
        <Tooltip
          label="Download this data source in GIS format."
          disabled={show}
        >
          <ActionIcon
            size="lg"
            title="Show download menu"
            classNames={{
              root: styles.actionIconRoot,
              icon: styles.actionIcon,
            }}
            onClick={() => setShow(!show)}
          >
            <DownloadIcon />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Box className={styles.downloadContent}>
          <Text size="sm" fw={700}>
            Download Formats
          </Text>
          <Group mt="var(--default-spacing)">
            <Button size="xs" onClick={() => handleDownload("kml")}>
              KML
            </Button>
            <Button size="xs" onClick={() => handleDownload("shp")}>
              Shapefile
            </Button>
          </Group>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};
