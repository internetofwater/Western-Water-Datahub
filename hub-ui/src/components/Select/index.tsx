/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Select as _Select,
  MultiSelect,
  MultiSelectProps,
  SelectProps,
} from "@mantine/core";

const Select: React.FC<SelectProps | MultiSelectProps> = (props) => {
  if (props.multiple) {
    return (
      <MultiSelect
        size="sm"
        searchable
        clearable
        {...(props as MultiSelectProps)}
      />
    );
  }

  return <_Select size="sm" searchable clearable {...(props as SelectProps)} />;
};

export default Select;
