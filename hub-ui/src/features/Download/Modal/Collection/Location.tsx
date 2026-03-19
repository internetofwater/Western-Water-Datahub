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
import { useDisclosure } from "@mantine/hooks";
import Code from "@/components/Code";
import CopyInput from "@/components/CopyInput";
import Tooltip from "@/components/Tooltip";
import { StringIdentifierCollections } from "@/consts/collections";
import { Charts } from "@/features/Charts";
import DateTime from "@/features/DateTime";
import styles from "@/features/Download/Download.module.css";
import { GeoJSON } from "@/features/Download/Modal/Collection/GeoJSON";
import { Parameter } from "@/features/Popup";
import { Table } from "@/features/Table";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
  IGetLocationParams,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLayer, TLocation } from "@/stores/main/types";
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { createEmptyCsv } from "@/utils/csv";
import { getIdStore, getLabel } from "@/utils/getLabel";
import { getParameterUnit } from "@/utils/parameters";
import { buildLocationUrl } from "@/utils/url";

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
  const [parameters, setParameters] = useState<Parameter[]>([]);

  const [from, setFrom] = useState<TLayer["from"]>(layer.from);
  const [to, setTo] = useState<TLayer["to"]>(layer.to);

  const [id, setId] = useState<string>(String(location.id));
  const [label, setLabel] = useState<string>(String(location.id));

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
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
      setDatasetName(collection.title ?? "");
      const paramObjects = Object.values(collection?.parameter_names ?? {});

      const parameters = paramObjects
        .filter(
          (object) =>
            object.type === "Parameter" && layer.parameters.includes(object.id),
        )
        .map((object) => ({
          id: object.id,
          name: object.observedProperty.label.en,
          unit: getParameterUnit(object),
        }));

      if (parameters.length === 0) {
        closeChart();
      }

      setParameters(parameters);
    }

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
  }, [location, layer]);
  useEffect(() => {
    if (layer.label) {
      const label = getLabel(location, layer.label);
      if (label) {
        setLabel(`${label} (${id})`);
      }
    }
  }, [layer, location, id]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

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

  const getData = (
    collectionId: ICollection["id"],
    locationId: TLocation["id"],
    params: IGetLocationParams,
    signal?: AbortSignal,
  ) =>
    wwdhService.getLocation<CoverageCollection | CoverageJSON>(
      collectionId,
      locationId,
      {
        signal,
        params,
      },
    );

  const handleFromChange = (from: TLayer["from"]) => setFrom(from);
  const handleToChange = (to: TLayer["to"]) => setTo(to);

  return (
    <Paper
      ref={ref}
      shadow="xl"
      className={`${styles.locationWrapper} ${linkLocation && linkLocation.collectionId === collection.id && linkLocation.id === String(location?.id) ? styles.locationHighlight : styles.locationStandard}`}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="md" fw={700}>
              {collection.title}
            </Text>
            <Text size="md">{label}</Text>
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
            <DateTime
              from={from}
              onFromChange={handleFromChange}
              to={to}
              onToChange={handleToChange}
              wait={300} // 0.3 second
            />
          </Group>
        </Group>
        <Stack>
          {openedChart && parameters.length > 0 && (
            <Collapse in={openedChart}>
              <Charts
                className={styles.linksChart}
                collectionId={layer.collectionId}
                locationIds={[id]}
                title={datasetName}
                parameters={parameters}
                from={from}
                to={to}
                getData={getData}
                tabs
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
