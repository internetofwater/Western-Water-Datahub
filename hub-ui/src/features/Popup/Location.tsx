/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Feature } from 'geojson';
import { Box, Group, Tooltip } from '@mantine/core';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { Variant } from '@/components/types';
import { StringIdentifierCollections } from '@/consts/collections';
import { Parameter } from '@/features/Popup';
import { Chart } from '@/features/Popup/Chart';
import styles from '@/features/Popup/Popup.module.css';
import { Table } from '@/features/TopBar/Links/Table';
import { Layer, Location as LocationType } from '@/stores/main/types';
import { getIdStore } from '@/utils/getIdStore';

type Props = {
  location: LocationType;
  locations: LocationType[];
  feature: Feature;
  layer: Layer;
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

  const [tab, setTab] = useState<'chart' | 'table'>('chart');
  const [id, setId] = useState<string>();

  useEffect(() => {
    if (parameters.length === 0) {
      setTab('table');
    }
  }, [parameters]);

  useEffect(() => {
    if (StringIdentifierCollections.includes(location.collectionId)) {
      const id = getIdStore(feature);
      setId(id);
    } else {
      setId(location.id);
    }
  }, [layer, location, feature]);

  return (
    <>
      <Box style={{ display: tab === 'chart' ? 'block' : 'none' }}>
        {layer && datasetName.length > 0 && parameters.length > 0 && id && (
          <Chart
            collectionId={location.collectionId}
            locationId={id}
            title={datasetName}
            parameters={layer.parameters}
            from={layer.from}
            to={layer.to}
          />
        )}
      </Box>
      <Box style={{ display: tab === 'table' ? 'block' : 'none' }} className={styles.tableWrapper}>
        {feature && <Table size="xs" properties={feature.properties} />}
      </Box>
      <Group
        justify="space-between"
        align="flex-end"
        mt="var(--default-spacing)"
        mb="var(--default-spacing)"
      >
        <Group gap="var(--default-spacing)" align="flex-end">
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
          {parameters.length > 0 ? (
            <Button
              size="xs"
              onClick={() => setTab('chart')}
              variant={tab === 'chart' ? Variant.Selected : Variant.Secondary}
            >
              Chart
            </Button>
          ) : (
            <Tooltip label="Select one or more parameters in the layer controls to enable charts.">
              <Button size="xs" variant={Variant.Secondary} disabled data-disabled>
                Chart
              </Button>
            </Tooltip>
          )}

          <Button
            size="xs"
            onClick={() => setTab('table')}
            variant={tab === 'table' ? Variant.Selected : Variant.Secondary}
          >
            Properties
          </Button>
        </Group>
        <Box component="span" className={styles.linkButtonWrapper}>
          {parameters.length > 0 ? (
            <Tooltip label="Open this location in the Links modal.">
              <Button size="xs" onClick={handleLinkClick} variant={Variant.Primary}>
                Link
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Select one or more parameters in the layer controls to access links modal.">
              <Button size="xs" variant={Variant.Primary} disabled data-disabled>
                Link
              </Button>
            </Tooltip>
          )}
        </Box>
      </Group>
    </>
  );
};
