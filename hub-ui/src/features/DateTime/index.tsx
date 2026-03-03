/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect } from "react";
import debounce from "lodash.debounce";
import { DateInput, DateInputProps } from "@mantine/dates";
import styles from "@/features/DateTime/DateTime.module.css";
import { TLayer } from "@/stores/main/types";

dayjs.extend(isSameOrBefore);

type Props = {
  from: TLayer["from"];
  onFromChange: (from: Props["from"]) => void;
  to: TLayer["to"];
  onToChange: (to: Props["to"]) => void;
  wait: number;
  error?: DateInputProps["error"];
};

const DateTime: React.FC<Props> = (props) => {
  const { from, onFromChange, to, onToChange, wait, error } = props;

  const debouncedOnFromChange = debounce(onFromChange, wait);
  const debouncedOnToChange = debounce(onToChange, wait);

  useEffect(() => {
    return () => {
      debouncedOnFromChange.cancel();
      debouncedOnToChange.cancel();
    };
  }, []);

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;

  return (
    <>
      <DateInput
        label="From"
        size="sm"
        classNames={{ root: styles.root }}
        placeholder="Pick start date"
        value={from}
        valueFormat="MM/DD/YYYY"
        onChange={debouncedOnFromChange}
        clearable
        error={error ? error : isValidRange ? false : "Invalid date range"}
      />
      <DateInput
        label="To"
        size="sm"
        classNames={{ root: styles.root }}
        placeholder="Pick end date"
        value={to}
        valueFormat="MM/DD/YYYY"
        onChange={debouncedOnToChange}
        clearable
        error={error ? error : isValidRange ? false : "Invalid date range"}
      />
    </>
  );
};

export default DateTime;
