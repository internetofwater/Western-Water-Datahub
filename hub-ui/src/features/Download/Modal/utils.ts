/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ComboboxData } from "@mantine/core";
import { ICollection } from "@/services/edr.service";

export const getParameterNameOptions = (
  parameterNames: ICollection["parameter_names"],
): ComboboxData => {
  return Object.values(parameterNames).map((parameterNameEntry) => {
    const unit = parameterNameEntry.unit.symbol.value;

    return {
      value: parameterNameEntry.id,
      label: `${parameterNameEntry.name} (${unit})`,
    };
  });
};
