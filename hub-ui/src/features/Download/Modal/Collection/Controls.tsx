/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  Button,
  ComboboxData,
  Group,
  MultiSelect,
  Stack,
  Text,
  VisuallyHidden,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Download/Download.module.css";
import { DatePreset, getSimplePresetDates } from "@/utils/dates";

dayjs.extend(isSameOrBefore);

type Props = {
  from: string | null;
  onFromChange: (from: string | null) => void;
  to: string | null;
  onToChange: (to: string | null) => void;
  parameters: string[];
  onParametersChange: (parameters: string[]) => void;
  parameterNameOptions: ComboboxData;
  onSearch: () => void;
  selectedLocations: string[];
};

const PARAMETER_LIMIT = 10;

const LOCATIONS_LIMIT = 10;

export const Controls: React.FC<Props> = (props) => {
  const {
    from,
    onFromChange,
    to,
    onToChange,
    parameters,
    onParametersChange,
    parameterNameOptions,
    onSearch,
    selectedLocations,
  } = props;

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;
  const isParameterSelectionUnderLimit = parameters.length <= PARAMETER_LIMIT;
  const areParametersSelected = parameters.length > 0;
  const isLocationSelectionUnderLimit =
    selectedLocations.length <= LOCATIONS_LIMIT;
  const hasLocations = selectedLocations.length > 0;

  const parameterHelpText = (
    <>
      <Text size="sm">
        Parameters are scientific measurements that may be available at a
        location.
      </Text>
      <br />
      <Text size="sm">
        These measurements are connected to an individual time and date.
      </Text>
    </>
  );

  return (
    <Group align="flex-start" gap="var(--default-spacing)" mb="lg">
      <Stack gap="xs" p={0}>
        {parameterNameOptions && (
          <>
            <MultiSelect
              size="sm"
              className={styles.parameterNameSelect}
              label={
                <Tooltip multiline label={parameterHelpText}>
                  <Group className={styles.parameterLabelWrapper} gap="xs">
                    <Text component="label" size="sm">
                      Parameters&nbsp;<span>*</span>
                    </Text>
                    <Info />
                  </Group>
                </Tooltip>
              }
              description="Select 1-10 parameters"
              placeholder="Select..."
              data={parameterNameOptions}
              value={parameters}
              onChange={onParametersChange}
              searchable
              clearable
              error={
                isParameterSelectionUnderLimit
                  ? false
                  : `Please remove ${parameters.length - PARAMETER_LIMIT} parameter${parameters.length - PARAMETER_LIMIT > 1 ? "s" : ""}`
              }
            />
            <VisuallyHidden>{parameterHelpText}</VisuallyHidden>
          </>
        )}
        <Text size="sm" c={isLocationSelectionUnderLimit ? "dimmed" : "red"}>
          {isLocationSelectionUnderLimit
            ? `${selectedLocations.length} location${selectedLocations.length - LOCATIONS_LIMIT === 1 ? "" : "s"} selected`
            : `Please remove ${selectedLocations.length - LOCATIONS_LIMIT} location${selectedLocations.length - LOCATIONS_LIMIT === 1 ? "" : "s"}`}
        </Text>
      </Stack>
      <Stack gap="xs" p={0}>
        <DatePickerInput
          label="From"
          description="Provide an optional date range"
          className={styles.datePicker}
          placeholder="Pick start date"
          value={from}
          onChange={onFromChange}
          clearable
          presets={getSimplePresetDates([
            DatePreset.OneYear,
            DatePreset.FiveYears,
            DatePreset.TenYears,
            DatePreset.FifteenYears,
            DatePreset.ThirtyYears,
          ])}
          error={isValidRange ? false : "Invalid date range"}
        />
        <DatePickerInput
          label="To"
          className={styles.datePicker}
          placeholder="Pick end date"
          value={to}
          onChange={onToChange}
          clearable
          presets={getSimplePresetDates([
            DatePreset.OneYear,
            DatePreset.FiveYears,
            DatePreset.TenYears,
            DatePreset.FifteenYears,
            DatePreset.ThirtyYears,
          ])}
          error={isValidRange ? false : "Invalid date range"}
        />
      </Stack>
      <Button
        disabled={
          !isValidRange ||
          !isParameterSelectionUnderLimit ||
          !areParametersSelected ||
          !isLocationSelectionUnderLimit ||
          !hasLocations
        }
        className={styles.goButton}
        onClick={onSearch}
      >
        Search
      </Button>
    </Group>
  );
};
