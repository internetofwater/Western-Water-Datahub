/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { forwardRef, useEffect, useRef, useState } from "react";
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
import Tooltip from "@/components/Tooltip";
import { StringIdentifierCollections } from "@/consts/collections";
import styles from "@/features/Download/Download.module.css";
import { Chart } from "@/features/Popup/Chart";
import { Table } from "@/features/Table";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { ICollection } from "@/services/edr.service";
import { TLayer, TLocation } from "@/stores/main/types";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { createEmptyCsv } from "@/utils/csv";
import { getIdStore } from "@/utils/getIdStore";
import { buildLocationUrl } from "@/utils/url";
import { GeoJSON } from "./GeoJSON";

dayjs.extend(isSameOrBefore);

type Props = {
  location: Feature;
  collection: ICollection;
  layer: TLayer;
  linkLocation?: TLocation | null;
};

export const Location = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { location, layer, collection, linkLocation } = props;

  const [openedProps, { toggle: toggleProps }] = useDisclosure(false);
  const [openedGeo, { toggle: toggleGeo }] = useDisclosure(false);
  const [openedChart, { toggle: toggleChart, close: closeChart }] =
    useDisclosure(false);

  const [url, setUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [datasetName, setDatasetName] = useState<string>("");
  const [parameters, setParameters] = useState<TLayer["parameters"]>([]);

  const [from, setFrom] = useState<TLayer["from"]>(layer.from);
  const [to, setTo] = useState<TLayer["to"]>(layer.to);

  const [id, setId] = useState<string>(String(location.id));

  const [isLoading, setIsLoading] = useState(false);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const url = buildLocationUrl(
      collection.id,
      id,
      layer.parameters,
      from,
      to,
      false,
      true,
    );

    const codeUrl = buildLocationUrl(
      collection.id,
      id,
      layer.parameters,
      from,
      to,
      false,
      false,
    );

    setUrl(url);
    setCodeUrl(codeUrl);
  }, [id, from, to]);

  useEffect(() => {
    if (!layer) {
      return;
    }

    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
      setDatasetName(collection.title ?? "");
      const paramObjects = Object.values(collection?.parameter_names ?? {});

      const parameters = paramObjects
        .filter((object) => layer.parameters.includes(object.id))
        .map((object) => object.name);

      if (parameters.length === 0) {
        closeChart();
      }

      setParameters(parameters);
    }
  }, [location, layer]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  useEffect(() => {
    if (StringIdentifierCollections.includes(layer.collectionId)) {
      const id = getIdStore(location);
      if (id) {
        setId(id);
      } else {
        setId(String(location.id));
      }
    } else {
      setId(String(location.id));
    }
  }, [layer, location]);

  const getFileName = () => {
    let name = `data-${location.id}-${layer.parameters.join("_")}`;

    if (from && dayjs(from).isValid()) {
      name += `-${dayjs(from).format("MM/DD/YYYY")}`;
    }

    if (to && dayjs(to).isValid()) {
      name += `-${dayjs(to).format("MM/DD/YYYY")}`;
    }

    return `${name}.csv`;
  };

  const handleCSVClick = async () => {
    const url = buildLocationUrl(
      collection.id,
      id,
      layer.parameters,
      from,
      to,
      true,
      true,
    );

    const loadingInstance = loadingManager.add(
      `Generating csv for location: ${location.id}`,
      ELoadingType.Data,
    );
    try {
      setIsLoading(true);

      if (!controller.current) {
        controller.current = new AbortController();
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(
          `Error: ${res.statusText.length > 0 ? res.statusText : "Unknown error"}`,
        );
      }

      let objectUrl = "";
      if (res.status === 204) {
        notificationManager.show(
          `No data found for location: ${location.id} with the current parameter and date range selection.`,
          ENotificationType.Error,
          10000,
        );
        objectUrl = createEmptyCsv();
      } else {
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = getFileName();
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(objectUrl);
      a.remove();
      notificationManager.show(
        "CSV generated successfully.",
        ENotificationType.Success,
        10000,
      );
    } catch (err) {
      if (((err as Error)?.message ?? "").length > 0) {
        notificationManager.show(
          (err as Error)?.message,
          ENotificationType.Error,
          10000,
        );
      } else if (typeof err === "string") {
        notificationManager.show(err, ENotificationType.Error, 10000);
      }
    } finally {
      loadingManager.remove(loadingInstance);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

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
            <Tooltip
              label="Select one or more parameters in the layer controls to enable charts."
              disabled={parameters.length > 0}
            >
              <Button
                size="xs"
                className={styles.propertiesButton}
                onClick={toggleChart}
              >
                Chart
              </Button>
            </Tooltip>
            <Tooltip
              label={
                isLoading
                  ? "Please wait for download to finish."
                  : "Download the parameter data in CSV format."
              }
            >
              <Button
                size="xs"
                disabled={isLoading}
                data-disabled={isLoading}
                className={styles.propertiesButton}
                onClick={handleCSVClick}
              >
                CSV
              </Button>
            </Tooltip>
          </Group>
          <Group gap="calc(var(--default-spacing) * 2)" align="flex-end">
            <DateInput
              label="From"
              size="sm"
              className={styles.datePicker}
              placeholder="Pick start date"
              value={from}
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
              onChange={setTo}
              clearable
              error={isValidRange ? false : "Invalid date range"}
            />
          </Group>
        </Group>
        <Stack>
          {openedChart && (
            <Collapse in={openedChart}>
              <Chart
                className={styles.linksChart}
                collectionId={layer.collectionId}
                locationId={id}
                title={datasetName}
                parameters={layer.parameters}
                from={from}
                to={to}
              />
            </Collapse>
          )}
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
