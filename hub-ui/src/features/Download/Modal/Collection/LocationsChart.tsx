/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useState } from "react";
import { Feature } from "geojson";
import { Button, Group, Stack } from "@mantine/core";
import Tooltip from "@/components/Tooltip";
import { StringIdentifierCollections } from "@/consts/collections";
import { Charts } from "@/features/Charts";
import DateTime from "@/features/DateTime";
import styles from "@/features/Download/Download.module.css";
import { Parameter } from "@/features/Popup";
import mainManager from "@/managers/Main.init";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
  IGetLocationParams,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLayer, TLocation } from "@/stores/main/types";
import { getIdStore, getLabel } from "@/utils/getLabel";
import { getParameterUnit } from "@/utils/parameters";

dayjs.extend(isSameOrBefore);

type Props = {
  layer: TLayer;
  locations: Feature[];
  isLoading: boolean;
  onGetAllCSV: () => void;
};

export const LocationsChart: React.FC<Props> = (props) => {
  const { layer, locations, isLoading, onGetAllCSV } = props;

  const [from, setFrom] = useState<TLayer["from"]>(layer.from);
  const [to, setTo] = useState<TLayer["to"]>(layer.to);
  const [parameters, setParameters] = useState<Parameter[]>([]);

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

  return (
    <Stack align="flex-start">
      {parameters.length > 0 && (
        <Charts
          collectionId={layer.collectionId}
          locationIds={organizedLocations.map(({ id }) => id)}
          parameters={parameters}
          from={from}
          to={to}
          coverageLabels={organizeLabels()}
          getData={getData}
          className={styles.bigChart}
          tabs
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
            onClick={onGetAllCSV}
          >
            Download All CSV's
          </Button>
        </Tooltip>
      </Group>
    </Stack>
  );
};
