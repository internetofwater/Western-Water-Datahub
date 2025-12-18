/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { forwardRef, useEffect, useState } from "react";
import { Feature } from "geojson";
import {
  Anchor,
  Button,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Code from "@/components/Code";
import CopyInput from "@/components/CopyInput";
import styles from "@/features/Download/Download.module.css";
import { Table } from "@/features/Table";
import { ICollection } from "@/services/edr.service";
import { TLayer, TLocation } from "@/stores/main/types";
import { buildItemUrl } from "@/utils/url";
import { GeoJSON } from "./GeoJSON";

dayjs.extend(isSameOrBefore);

type Props = {
  location: Feature;
  collection: ICollection;
  layer: TLayer;
  linkLocation?: TLocation | null;
};

export const Item = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { location, collection, linkLocation } = props;

  const [openedProps, { toggle: toggleProps }] = useDisclosure(false);
  const [openedGeo, { toggle: toggleGeo }] = useDisclosure(false);

  const [url, setUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");

  useEffect(() => {
    const url = buildItemUrl(collection.id, String(location.id));

    const codeUrl = buildItemUrl(collection.id, String(location.id));

    setUrl(url);
    setCodeUrl(codeUrl);
  }, [location]);

  const code = `curl -X GET ${codeUrl} \n
-H "Content-Type: application/json"`;

  return (
    <Paper
      ref={ref}
      shadow="xl"
      className={`${styles.locationWrapper} ${linkLocation && linkLocation.id === String(location?.id) ? styles.highlightLocation : ""}`}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="md" fw={700}>
              {collection.title}
            </Text>
            <Text size="md">{location.id}</Text>
          </Group>
          <Anchor title="This item in the API" href={url} target="_blank">
            API
          </Anchor>
        </Group>
        <CopyInput size="xs" className={styles.copyInput} url={url} />
        <Code size="xs" code={code} />
        <Group justify="space-between" align="flex-end">
          <Group gap="var(--default-spacing)">
            <Button
              size="xs"
              className={styles.propertiesButton}
              onClick={toggleProps}
            >
              Properties
            </Button>
            <Button
              size="xs"
              className={styles.propertiesButton}
              onClick={toggleGeo}
            >
              GeoJSON
            </Button>
          </Group>
        </Group>
        <Stack>
          <Group align="flex-start" gap="calc(var(--default-spacing) * 2)" grow>
            {openedProps && (
              <Collapse in={openedProps}>
                <Table properties={location.properties} search />
              </Collapse>
            )}
            {openedGeo && (
              <Collapse in={openedGeo}>
                <GeoJSON location={location} />
              </Collapse>
            )}
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
});
