/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export enum StateField {
  Statens = "statens",
  Fid = "fid",
  Lsad = "lsad",
  CensusProfile = "census_profile",
  AffGeoid = "affgeoid",
  StateFp = "statefp",
  Uri = "uri",
  Acronym = "stusps",
  Name = "name",
}

export type StateProperties = {
  [StateField.Statens]: string;
  [StateField.Fid]: number;
  [StateField.Lsad]: string;
  [StateField.CensusProfile]: string;
  [StateField.AffGeoid]: string;
  [StateField.StateFp]: string;
  [StateField.Uri]: string;
  [StateField.Acronym]: string;
  [StateField.Name]: string;
};
