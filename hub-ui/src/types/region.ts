/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export enum RegionField {
  ObjectId = "OBJECTID",
  RegNum = "REG_NUM",
  Name = "REG_NAME",
  AreaSqMi = "AREA_SQMI",
  AreaAcres = "AREA_ACRES",
  ShapeArea = "Shape__Area",
  ShapeLength = "Shape__Length",
}

export type RegionProperties = {
  [RegionField.ObjectId]: number;
  [RegionField.RegNum]: number;
  [RegionField.Name]: string;
  [RegionField.AreaSqMi]: number;
  [RegionField.AreaAcres]: number;
  [RegionField.ShapeArea]: number;
  [RegionField.ShapeLength]: number;
};
