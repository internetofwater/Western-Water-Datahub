/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { CoverageJSON } from "@/services/edr.service";

export type TValues = Record<string, (number | null)[]>;
export type TAxes = {
  t: { values: string[] };
  x: { start: number; stop: number; num: number };
  y: { start: number; stop: number; num: number };
};

export type TOptions = {
  chosenParameter?: string;
  chosenUnit?: string;
};

export type TCoverageOptions = TOptions & {
  parameters?: CoverageJSON["parameters"];
};

export type TFilteredRange = [
  string,
  {
    type: string;
    values: number[];
  },
];
