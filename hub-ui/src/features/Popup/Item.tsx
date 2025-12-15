/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature } from 'geojson';
import { Box, Button, Group, Tooltip } from '@mantine/core';
import Select from '@/components/Select';
import styles from '@/features/Popup/Popup.module.css';
import { TLocation as LocationType } from '@/stores/main/types';
import { Table } from '../Table';

type Props = {
  location: LocationType;
  locations: LocationType[];
  feature: Feature;
  handleLocationChange: (id: string | null) => void;
  handleLinkClick: () => void;
};

export const Item: React.FC<Props> = (props) => {
  const { location, locations, feature, handleLocationChange, handleLinkClick } = props;

  return (
    <>
      <Box className={styles.tableWrapper}>
        {feature && <Table size="xs" properties={feature.properties} />}
      </Box>
      <Group
        justify="space-between"
        align="flex-end"
        mt="var(--default-spacing)"
        mb="var(--default-spacing)"
      >
        {locations.length > 1 && (
          <Select
            className={styles.locationsDropdown}
            size="xs"
            label="Items"
            searchable
            data={locations.map((location) => location.id)}
            value={location.id}
            onChange={(value, _option) => handleLocationChange(value)}
          />
        )}
        <Box component="span" className={styles.linkButtonWrapper}>
          <Tooltip label="Open this item in the Links modal.">
            <Button size="xs" onClick={handleLinkClick}>
              Link
            </Button>
          </Tooltip>
        </Box>
      </Group>
    </>
  );
};
