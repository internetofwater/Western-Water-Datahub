/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Feature } from "geojson";
import { Button, Group, Progress } from "@mantine/core";
import Tooltip from "@/components/Tooltip";
import { StringIdentifierCollections } from "@/consts/collections";
import { Charts } from "@/features/Charts";
import DateTime from "@/features/DateTime";
import styles from "@/features/Download/Download.module.css";
import { Parameter } from "@/features/Popup";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { TZipLink, ZipService } from "@/services/csv.service";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
  IGetCubeParams,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLayer } from "@/stores/main/types";
import { ENotificationType } from "@/stores/session/types";
import { getIdStore, getLabel } from "@/utils/getLabel";
import { normalizeBBox } from "@/utils/normalizeBBox";
import { getParameterUnit } from "@/utils/parameters";
import { buildCubeUrl } from "@/utils/url";

dayjs.extend(isSameOrBefore);

type Props = {
  layer: TLayer;
  locations: Feature[];
};

export const GridsChart: React.FC<Props> = (props) => {
  const { layer, locations } = props;

  const [from, setFrom] = useState<TLayer["from"]>(layer.from);
  const [to, setTo] = useState<TLayer["to"]>(layer.to);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const isStringIdentifierCollection = StringIdentifierCollections.includes(
    layer.collectionId,
  );

  const organizedLocations = useMemo(() => {
    return locations.map((location) => {
      const id = String(
        isStringIdentifierCollection
          ? (getIdStore(location) ?? location.id)
          : location.id,
      );
      const label = layer.label ? (getLabel(location, layer.label) ?? id) : id;
      return { id, label };
    });
  }, [locations]);

  const organizeLabels = () => {
    const labels: Record<string, string> = {};

    for (const location of organizedLocations) {
      labels[location.id] =
        location.label !== location.id
          ? `${location.label} (${location.id})`
          : location.label;
    }
    return labels;
  };

  const getData = (
    collectionId: ICollection["id"],
    locationId: string,
    params: IGetCubeParams,
    signal?: AbortSignal,
  ) => {
    const location = locations.find(
      (location) =>
        String(
          isStringIdentifierCollection
            ? (getIdStore(location) ?? location.id)
            : location.id,
        ) === locationId,
    );

    if (location) {
      const bbox = location.bbox;
      if (bbox) {
        const normalizedBBox = normalizeBBox(bbox);
        return wwdhService.getCube<CoverageCollection | CoverageJSON>(
          collectionId,
          {
            signal,
            params: { ...params, bbox: normalizedBBox },
          },
        );
      }
    }

    console.error("Location without bbox detected: ", location);

    // Stub collection to resolve type issues
    // This statement should never be reached
    return {
      type: "CoverageCollection",
      domainType: "PointSeries",
      coverages: [],
      parameters: {},
    } as CoverageCollection;
  };

  const getId = (feature: Feature) => {
    if (isStringIdentifierCollection) {
      return getIdStore(feature) ?? String(feature.id);
    }

    return String(feature.id);
  };

  const getFileName = (locationId: string, layer: TLayer) => {
    let name = `data-${locationId}-${layer.parameters.join("_")}`;

    if (layer.from && dayjs(layer.from).isValid()) {
      name += `-${dayjs(layer.from).format("MM_DD_YYYY")}`;
    }

    if (layer.to && dayjs(layer.to).isValid()) {
      name += `-${dayjs(layer.to).format("MM_DD_YYYY")}`;
    }

    return `${name}.csv`;
  };

  const buildLink = (
    location: Feature,
    layer: TLayer,
  ): TZipLink | undefined => {
    if (!location.bbox) {
      return undefined;
    }

    const url = buildCubeUrl(
      layer.collectionId,
      location.bbox,
      layer.parameters,
      from,
      to,
      true,
      true,
    );

    const fileName = getFileName(getId(location), layer);
    return { url, fileName };
  };

  const handleGetAllCSV = async () => {
    setIsLoading(true);

    if (!controller.current) {
      controller.current = new AbortController();
    }

    // Create link, exclude locations w/out a bbox
    const links = locations
      .map((location) => buildLink(location, layer))
      .filter(Boolean) as TZipLink[];

    let count = 0;

    const handleEntryProgress = (
      name: string,
      loaded: number,
      total?: number,
    ) => {
      console.log(
        `Generated file: ${name}\n File size: ${loaded} bytes${typeof total === "number" ? `, total zip size: ${total} bytes.` : "."}`,
      );
      const progress = (count / links.length) * 100;
      count += 1;
      if (isMounted.current) {
        setProgress(progress);
      }
    };

    const zipBlob = await new ZipService().getZipFileBlob(links, {
      compressionLevel: 6,
      zip64: true,
      signal: controller.current.signal,
      onEntryProgress: handleEntryProgress,
      onEntryError: (name, error) => {
        notificationManager.show(
          `An error occurred generating file: ${name}. See console for further details.`,
          ENotificationType.Error,
          10000,
        );
        console.error("Error", name, error);
        return true;
      },
    });

    if (isMounted.current) {
      notificationManager.show(
        "All CSV's generated",
        ENotificationType.Success,
        10000,
      );

      const objectUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${layer.collectionId}-${locations.map((feature) => getId(feature)).join("_")}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(objectUrl);
      a.remove();
      setIsLoading(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection) {
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

      setParameters(parameters);
    }
  }, [layer]);

  const handleFromChange = (from: TLayer["from"]) => setFrom(from);
  const handleToChange = (to: TLayer["to"]) => setTo(to);

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;

  const disabled =
    organizedLocations.length === 0 || isLoading || !isValidRange;

  const organizedLabels = useMemo(() => organizeLabels(), [organizedLocations]);

  return (
    <>
      {parameters.length > 0 && (
        <Charts
          collectionId={layer.collectionId}
          locationIds={organizedLocations.map(({ id }) => id)}
          parameters={parameters}
          from={from}
          to={to}
          coverageLabels={organizedLabels}
          getData={getData}
          className={styles.bigChart}
          tabs
          tabHeight={31.875}
        />
      )}

      <Group w="100%" justify="space-between" align="flex-end">
        <Group gap="calc(var(--default-spacing) * 2)" align="flex-end">
          <DateTime
            from={from}
            onFromChange={handleFromChange}
            to={to}
            onToChange={handleToChange}
            wait={300} // 0.3 second
          />
        </Group>
        <Tooltip
          label={
            isLoading
              ? "Please wait for download to finish."
              : `Download the parameter data for all selected locations in CSV format.`
          }
          multiline
        >
          <Button
            size="sm"
            disabled={disabled}
            data-disabled={disabled}
            onClick={handleGetAllCSV}
          >
            Download All
          </Button>
        </Tooltip>
      </Group>
      {isLoading && <Progress w="100%" value={progress} />}
    </>
  );
};
