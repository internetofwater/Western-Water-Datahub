/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useMemo, useState } from "react";
import { Group, Stack, Text, Title, VisuallyHidden } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import { CollectionRestrictions, RestrictionType } from "@/consts/collections";
import styles from "@/features/Panel/Panel.module.css";
import useMainStore from "@/stores/main";

dayjs.extend(isSameOrBefore);

export const DateSelect: React.FC = () => {
  const from = useMainStore((state) => state.from);
  const setFrom = useMainStore((state) => state.setFrom);
  const to = useMainStore((state) => state.to);
  const setTo = useMainStore((state) => state.setTo);

  const selectedCollections = useMainStore(
    (state) => state.selectedCollections,
  );
  const [daysLimit, setDaysLimit] = useState<number>(0);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let minLimit = Infinity;

    for (const collectionId of selectedCollections) {
      const restrictions = CollectionRestrictions[collectionId];
      if (!restrictions?.length) {
        continue;
      }

      const daysRestriction = restrictions.find(
        (r) => r.type === RestrictionType.Day,
      );

      if (daysRestriction) {
        minLimit = Math.min(minLimit, daysRestriction.days);
      }
    }

    setDaysLimit(minLimit === Infinity ? 0 : minLimit);
  }, [selectedCollections]);

  const fromValid = useMemo(
    () => (from ? dayjs(from).isValid() : false),
    [from],
  );
  const toValid = useMemo(() => (to ? dayjs(to).isValid() : false), [to]);

  const bothExistAndValid = fromValid && toValid;

  // From must be <= to.
  const isOrdered = useMemo(() => {
    if (!bothExistAndValid) {
      return true;
    } // only enforce ordering when both exist
    return dayjs(from).isSameOrBefore(dayjs(to));
  }, [bothExistAndValid, from, to]);

  const diffDays = useMemo(() => {
    if (!bothExistAndValid || !isOrdered) {
      return null;
    } // only meaningful when ordered and both valid

    return dayjs(to).diff(dayjs(from), "day");
  }, [bothExistAndValid, isOrdered, from, to]);

  useEffect(() => {
    // If a limit exists, we REQUIRE both dates to be present and valid.
    if (daysLimit > 0) {
      if (!from || !to || !fromValid || !toValid) {
        setError("Start and end dates are required");
        return;
      }
      if (!isOrdered) {
        setError("Invalid date range");
        return;
      }
      if (diffDays !== null && diffDays > daysLimit) {
        setError(`${diffDays - daysLimit} day(s) over limit`);
        return;
      }
      setError(undefined);
      return;
    }

    // No limit: only enforce ordering when both exist & valid.
    if (bothExistAndValid && !isOrdered) {
      setError("Invalid date range");
      return;
    }

    setError(undefined);
  }, [
    daysLimit,
    from,
    to,
    fromValid,
    toValid,
    bothExistAndValid,
    isOrdered,
    diffDays,
  ]);

  const helpText = (
    <>
      <Text size="sm">Select the date range to apply to all collections.</Text>
      <br />
      <Text size="sm">
        This date range will serve as the default range used to create charts or
        fetch data for gridded collections.
      </Text>
    </>
  );

  return (
    <Stack gap={0} className={styles.selectStack}>
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
        <DateInput
          size="xs"
          label="From"
          className={styles.datePicker}
          placeholder="Pick start date"
          valueFormat="MM/DD/YYYY"
          value={from}
          onChange={setFrom}
          clearable
          withAsterisk={daysLimit > 0}
          // presets={getSimplePresetDates([
          //   DatePreset.OneYear,
          //   DatePreset.FiveYears,
          //   DatePreset.TenYears,
          //   DatePreset.FifteenYears,
          //   DatePreset.ThirtyYears,
          // ])}
          error={error}
        />
        <DateInput
          size="xs"
          label="To"
          className={styles.datePicker}
          placeholder="Pick end date"
          valueFormat="MM/DD/YYYY"
          value={to}
          onChange={setTo}
          clearable
          withAsterisk={daysLimit > 0}
          // presets={getSimplePresetDates([
          //   DatePreset.OneYear,
          //   DatePreset.FiveYears,
          //   DatePreset.TenYears,
          //   DatePreset.FifteenYears,
          //   DatePreset.ThirtyYears,
          // ])}
          error={error}
        />
      </Group>
    </Stack>
  );
};
