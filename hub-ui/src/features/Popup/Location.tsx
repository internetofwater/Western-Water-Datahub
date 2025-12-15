/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Feature } from 'geojson';
import { Box, Button, Group, Tooltip } from '@mantine/core';
import Select from '@/components/Select';
import { StringIdentifierCollections } from '@/consts/collections';
import { Parameter } from '@/features/Popup';
import { Chart } from '@/features/Popup/Chart';
import styles from '@/features/Popup/Popup.module.css';
import useMainStore from '@/stores/main';
import { TLocation } from '@/stores/main/types';
import { getIdStore } from '@/utils/getIdStore';
import { Table } from '../Table';

type Props = {
  location: TLocation;
  locations: TLocation[];
  feature: Feature;
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
    datasetName,
    parameters,
    handleLocationChange,
    handleLinkClick,
  } = props;

  const [tab, setTab] = useState<'chart' | 'table'>('chart');
  const [id, setId] = useState<string>();

  const from = useMainStore((state) => state.from);
  const to = useMainStore((state) => state.to);

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
  }, [location, feature]);

  return (
    <>
      <Box style={{ display: tab === 'chart' ? 'block' : 'none' }}>
        {datasetName.length > 0 && parameters.length > 0 && id && (
          <Chart
            collectionId={location.collectionId}
            locationId={id}
            parameters={parameters.map((parameter) => parameter.id)}
            title={datasetName}
            from={from}
            to={to}
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
            <Button size="xs" onClick={() => setTab('chart')}>
              Chart
            </Button>
          ) : (
            <Tooltip label="Select one or more parameters in the layer controls to enable charts.">
              <Button size="xs" disabled data-disabled>
                Chart
              </Button>
            </Tooltip>
          )}

          <Button size="xs" onClick={() => setTab('table')}>
            Properties
          </Button>
        </Group>
        <Box component="span" className={styles.linkButtonWrapper}>
          {parameters.length > 0 ? (
            <Tooltip label="Open this location in the Links modal.">
              <Button size="xs" onClick={handleLinkClick}>
                Link
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Select one or more parameters in the layer controls to access links modal.">
              <Button size="xs" disabled data-disabled>
                Link
              </Button>
            </Tooltip>
          )}
        </Box>
      </Group>
    </>
  );
};
