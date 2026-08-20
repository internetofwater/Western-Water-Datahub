/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { TCoverageOptions } from '@/services/coverageJSON/types';

export const isTimeAxis = (options: TCoverageOptions): boolean => {
  return options && options?.axisStyle === 'time';
};

export const isValuesAxis = (options: TCoverageOptions): boolean => {
  return options && options?.axisStyle === 'values';
};
