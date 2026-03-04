/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Feature } from "geojson";
import { Box, Button, Group, Stack, Tooltip } from "@mantine/core";
import Select from "@/components/Select";
import { StringIdentifierCollections } from "@/consts/collections";
import { Charts } from "@/features/Charts";
import { Parameter } from "@/features/Popup";
import styles from "@/features/Popup/Popup.module.css";
import { Table } from "@/features/Table";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
  IGetLocationParams,
} from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { TLayer, TLocation } from "@/stores/main/types";
import { getIdStore } from "@/utils/getLabel";

type Props = {
  location: TLocation;
  locations: TLocation[];
  feature: Feature;
  layer: TLayer;
  datasetName: string;
  parameters: Parameter[];
  handleLocationChange: (id: string | null) => void;
  handleLinkClick: () => void;
};

export const Location: React.FC<Props> = (props) => {
  const {
    location,
    locations,
    feature,
    layer,
    datasetName,
    parameters,
    handleLocationChange,
    handleLinkClick,
  } = props;

  const [tab, setTab] = useState<"chart" | "table">("chart");
  const [id, setId] = useState<string>();
  const [selectedParameter, setSelectedParameter] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (parameters.length === 0) {
      setTab("table");
      return;
    }

    if (
      !selectedParameter ||
      !parameters.some((parameter) => parameter.id === selectedParameter)
    ) {
      setSelectedParameter(parameters[0].id);
    }
  }, [parameters]);

  useEffect(() => {
    if (StringIdentifierCollections.includes(location.collectionId)) {
      const id = getIdStore(feature);
      setId(id);
    } else {
      setId(location.id);
    }
  }, [location, feature]);

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

  return (
    <>
      <Box style={{ display: tab === "chart" ? "block" : "none" }}>
        {datasetName.length > 0 && parameters.length > 0 && id && (
          <Charts
            collectionId={location.collectionId}
            locationIds={[id]}
            parameters={parameters}
            title={datasetName}
            from={layer.from}
            to={layer.to}
            getData={getData}
            value={selectedParameter}
            className={styles.chartWrapper}
          />
        )}
      </Box>
      <Box
        style={{ display: tab === "table" ? "block" : "none" }}
        className={styles.tableWrapper}
      >
        {feature && <Table size="xs" properties={feature.properties} />}
      </Box>
      <Stack
        justify="space-between"
        mt="var(--default-spacing)"
        mb="var(--default-spacing)"
      >
        <Group gap="calc(var(--default-spacing) / 2)" align="flex-end">
          {locations.length > 1 && (
            <Select
              className={styles.locationsDropdown}
              size="xs"
              label="Locations"
              searchable
              data={locations.map((location) => location.id)}
              value={location.id}
              onChange={(value, _option) => handleLocationChange(value)}
            />
          )}
          {parameters.length > 0 && tab === "chart" && (
            <Select
              className={styles.parametersDropdown}
              size="xs"
              label="Parameters"
              searchable
              data={parameters.map((parameter) => ({
                value: parameter.id,
                label: `${parameter.name} (${parameter.unit})`,
              }))}
              value={selectedParameter}
              onChange={setSelectedParameter}
              clearable={false}
            />
          )}
        </Group>
        <Group
          gap="var(--default-spacing)"
          align="flex-end"
          justify="space-between"
        >
          <Group gap="calc(var(--default-spacing) / 2)">
            {parameters.length > 0 ? (
              <Button size="xs" onClick={() => setTab("chart")}>
                Chart
              </Button>
            ) : (
              <Tooltip label="Select one or more parameters in the layer controls to enable charts.">
                <Button size="xs" disabled data-disabled>
                  Chart
                </Button>
              </Tooltip>
            )}

            <Button size="xs" onClick={() => setTab("table")}>
              Properties
            </Button>
          </Group>

          {parameters.length > 0 ? (
            <Tooltip label="Open this location in the Download modal.">
              <Button size="xs" onClick={handleLinkClick}>
                Download
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Select one or more parameters in the layer controls to access Download modal.">
              <Button size="xs" disabled data-disabled>
                Download
              </Button>
            </Tooltip>
          )}
        </Group>
      </Stack>
    </>
  );
};
