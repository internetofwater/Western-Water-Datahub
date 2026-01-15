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
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import Code from "@/components/Code";
import CopyInput from "@/components/CopyInput";
import styles from "@/features/Download/Download.module.css";
import { GeoJSON } from "@/features/Download/Modal/Collection/GeoJSON";
import { Table } from "@/features/Table";
import { ICollection } from "@/services/edr.service";
import { TLayer, TLocation } from "@/stores/main/types";
import { buildCubeUrl } from "@/utils/url";

dayjs.extend(isSameOrBefore);

type Props = {
  location: Feature;
  collection: ICollection;
  layer: TLayer;
  linkLocation?: TLocation | null;
};

export const Grid = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { location, layer, collection, linkLocation } = props;

  const [openedProps, { toggle: toggleProps }] = useDisclosure(false);
  const [openedGeo, { toggle: toggleGeo }] = useDisclosure(false);

  const [url, setUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [_datasetName, setDatasetName] = useState<string>("");
  const [_parameters, setParameters] = useState<string[]>([]);

  const [from, setFrom] = useState<string | null>(layer.from);
  const [to, setTo] = useState<string | null>(layer.to);

  useEffect(() => {
    if (!location.bbox) {
      return;
    }

    const url = buildCubeUrl(
      collection.id,
      location.bbox,
      layer.parameters,
      from,
      to,
      false,
      true,
    );

    const codeUrl = buildCubeUrl(
      collection.id,
      location.bbox,
      layer.parameters,
      from,
      to,
      false,
      false,
    );

    setUrl(url);
    setCodeUrl(codeUrl);
  }, [from, to]);

  useEffect(() => {
    if (!layer) {
      return;
    }

    setDatasetName(collection.title ?? "");
    const paramObjects = Object.values(collection?.parameter_names ?? {});

    const parameters = paramObjects
      .filter((object) => layer.parameters.includes(object.id))
      .map((object) => object.name);

    setParameters(parameters);
  }, [collection]);

  const code = `curl -X GET ${codeUrl} \n
-H "Content-Type: application/json"`;

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;

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
          <Anchor
            title="This location in the API"
            href={`${collection.data_queries.locations?.link?.href}/${location.id}`}
            target="_blank"
          >
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
          <Group gap="calc(var(--default-spacing) * 2)" align="flex-end">
            <DateInput
              label="From"
              size="sm"
              className={styles.datePicker}
              placeholder="Pick start date"
              value={from}
              valueFormat="MM/DD/YYYY"
              onChange={setFrom}
              clearable
              error={isValidRange ? false : "Invalid date range"}
            />
            <DateInput
              label="To"
              size="sm"
              className={styles.datePicker}
              placeholder="Pick end date"
              value={to}
              valueFormat="MM/DD/YYYY"
              onChange={setTo}
              clearable
              error={isValidRange ? false : "Invalid date range"}
            />
          </Group>
        </Group>
        <Stack>
          <Group align="flex-start" gap="calc(var(--default-spacing) * 2)" grow>
            {openedProps && (
              <Collapse in={openedProps}>
                <Table properties={location.properties} />
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
