/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Group, Stack, Text, Title, VisuallyHidden } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import Info from '@/assets/Info';
import Tooltip from '@/components/Tooltip';
import styles from '@/features/Panel/Panel.module.css';
import useMainStore from '@/stores/main';
import { DatePreset, getSimplePresetDates } from '@/utils/dates';

dayjs.extend(isSameOrBefore);

export const DateSelect: React.FC = () => {
  const from = useMainStore((state) => state.from);
  const setFrom = useMainStore((state) => state.setFrom);
  const to = useMainStore((state) => state.to);
  const setTo = useMainStore((state) => state.setTo);

  const isValidRange = from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;

  const helpText = (
    <>
      <Text size="sm">Select the date range to apply to all collections.</Text>
      <br />
      <Text size="sm">
        This date range will serve as the default range used to create charts or fetch data for
        gridded collections.
      </Text>
    </>
  );

  return (
    <Stack gap={0}>
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h4">
            Configure date range
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Group grow>
        <DatePickerInput
          size="xs"
          label="From"
          className={styles.datePicker}
          placeholder="Pick start date"
          valueFormat="MM/DD/YYYY"
          value={from}
          onChange={setFrom}
          clearable
          presets={getSimplePresetDates([
            DatePreset.OneYear,
            DatePreset.FiveYears,
            DatePreset.TenYears,
            DatePreset.FifteenYears,
            DatePreset.ThirtyYears,
          ])}
          error={isValidRange ? false : 'Invalid date range'}
        />
        <DatePickerInput
          size="xs"
          label="To"
          className={styles.datePicker}
          placeholder="Pick end date"
          valueFormat="MM/DD/YYYY"
          value={to}
          onChange={setTo}
          clearable
          presets={getSimplePresetDates([
            DatePreset.OneYear,
            DatePreset.FiveYears,
            DatePreset.TenYears,
            DatePreset.FifteenYears,
            DatePreset.ThirtyYears,
          ])}
          error={isValidRange ? false : 'Invalid date range'}
        />
      </Group>
    </Stack>
  );
};
