/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { IRequestParams } from "@ogcapi-js/shared";
import { ComboboxItem } from "@mantine/core";
import {
  CoverageCollection,
  CoverageJSON,
  ICollection,
} from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";

export enum ETabTypes {
  Unit = "unit",
  Parameter = "parameter",
}

export type TTypedOption = ComboboxItem & {
  type: ETabTypes;
};

export type TWrappedCoverage = {
  data: CoverageCollection | CoverageJSON;
  label?: string;
  locationId: TLocation["id"];
  params: IRequestParams;
  collectionId: ICollection["id"];
  createdAt: number;
};

export type TCoverageLabel =
  | Record<string, string>
  | ((args: {
      locationId: TLocation["id"];
      index: number; // index into locationIds
      coverage: CoverageCollection | CoverageJSON;
    }) => string);
