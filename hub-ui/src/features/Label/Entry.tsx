/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { GeoJsonProperties } from "geojson";
import { Button, Stack, Text } from "@mantine/core";
import Select from "@/components/Select";
import styles from "@/features/Label/Label.module.css";
import { Table } from "@/features/Table";
import { useLocations } from "@/hooks/useLocations";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer } from "@/stores/main/types";
import { sortObject } from "@/utils/sortObject";

type Props = {
  layer: TLayer;
};

export const Entry: React.FC<Props> = (props) => {
  const { layer } = props;

  const updateLayer = useMainStore((state) => state.updateLayer);

  const [title, setTitle] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [sampleProperties, setSampleProperties] = useState<GeoJsonProperties>(
    {},
  );

  const { selectedLocations, otherLocations } = useLocations(layer);

  useEffect(() => {
    const collection = mainManager.getCollection(layer.collectionId);

    if (collection && collection?.title) {
      setTitle(collection.title);
    }
  }, [layer]);

  useEffect(() => {
    const location =
      selectedLocations.length > 0
        ? selectedLocations[0]
        : otherLocations.length > 0
          ? otherLocations[0]
          : null;

    if (location) {
      setSampleProperties(sortObject(location.properties));
    }
  }, [selectedLocations, otherLocations]);

  const handleShow = () => {
    setShowTable(!showTable);
  };

  const handleChange = (label: string | null) => {
    updateLayer({
      ...layer,
      label,
    });
  };

  const options = Object.keys(sampleProperties ?? {});

  return (
    <Stack className={styles.entry} gap="calc(var(--default-spacing) / 2)">
      <Select
        size="xs"
        label={
          <Text size="xs" fw={700} title={title}>
            {title}
          </Text>
        }
        placeholder="Select..."
        disabled={options.length === 0}
        data={options}
        value={layer.label}
        onChange={handleChange}
      />
      <Button onClick={handleShow} size="xs" mt="var(--default-spacing)">
        {showTable ? "Hide Sample Feature" : "Show Sample Feature"}
      </Button>
      {showTable && <Table properties={sampleProperties} search size="xs" />}
    </Stack>
  );
};
