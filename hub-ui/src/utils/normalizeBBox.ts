/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { BBox } from "geojson";

export const normalizeBBox = (bbox: BBox): BBox => {
  const [x1, y1, x2, y2] = bbox;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return [minX, minY, maxX, maxY];
};
