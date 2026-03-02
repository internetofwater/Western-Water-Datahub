/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useState } from "react";
import { Feature } from "geojson";
import { Button, Group, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import Tooltip from "@/components/Tooltip";
import { StringIdentifierCollections } from "@/consts/collections";
import { Charts } from "@/features/Charts";
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
      labels[location.id] = `${location.label} (${location.id})`;
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
    const newDataset = mainManager.getCollection(layer.collectionId);

    if (newDataset) {
      const paramObjects = Object.values(newDataset?.parameter_names ?? {});

      const parameters = paramObjects
        .filter(
          (object) =>
            object.type === "Parameter" && layer.parameters.includes(object.id),
        )
        .map((object) => ({
          id: object.id,
          name: object.name,
          unit: getParameterUnit(object),
        }));

      setParameters(parameters);
    }
  }, [layer]);

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;

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
      </Group>
    </Stack>
  );
};
