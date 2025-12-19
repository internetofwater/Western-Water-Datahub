/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { BBox } from "geojson";
import { ICollection } from "@/services/edr.service";
import { TLocation } from "@/stores/main/types";

export const getDatetime = (
  from: string | null | undefined,
  to: string | null | undefined,
): string | null => {
  if (from && to) {
    return `${from}/${to}`;
  } else if (from) {
    return `${from}/..`;
  } else if (to) {
    return `../${to}`;
  }
  return null;
};

export const buildLocationsUrl = (
  collectionId: ICollection["id"],
  parameters: string[],
): string => {
  const url = new URL(
    `${import.meta.env.VITE_WWDH_UNCACHE_SOURCE}/collections/${collectionId}/locations`,
  );

  if (parameters.length > 0) {
    url.searchParams.set("parameter-name", parameters.join(","));
  }

  return url.toString();
};

export const buildLocationUrl = (
  collectionId: ICollection["id"],
  locationId: TLocation["id"],
  parameters: string[],
  from: string | null,
  to: string | null,
  csv: boolean = false,
  format: boolean = true,
): string => {
  const url = new URL(
    `${import.meta.env.VITE_WWDH_UNCACHE_SOURCE}/collections/${collectionId}/locations/${locationId}`,
  );

  if (format) {
    url.searchParams.set("f", csv ? "csv" : "json");
  }

  if (parameters.length > 0) {
    url.searchParams.set("parameter-name", parameters.join(","));
  }

  const datetime = getDatetime(from, to);

  if (datetime) {
    url.searchParams.set("datetime", datetime);
  }

  return url.toString();
};

export const buildItemUrl = (
  collectionId: ICollection["id"],
  locationId: TLocation["id"],
  format: null | "csv" | "json" | "kml" | "shp" = null,
): string => {
  const url = new URL(
    `${import.meta.env.VITE_WWDH_UNCACHE_SOURCE}/collections/${collectionId}/items/${locationId}`,
  );

  if (format && format.length) {
    url.searchParams.set("f", format);
  }
  return url.toString();
};

export const buildItemsUrl = (
  collectionId: ICollection["id"],
  format: null | "csv" | "json" | "kml" | "shp" = null,
): string => {
  const url = new URL(
    `${import.meta.env.VITE_WWDH_UNCACHE_SOURCE}/collections/${collectionId}/items`,
  );

  if (format && format.length) {
    url.searchParams.set("f", format);
  }
  return url.toString();
};

const normalizeBBox = (bbox: BBox) => {
  const [x1, y1, x2, y2] = bbox;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return [minX, minY, maxX, maxY];
};

export const buildCubeUrl = (
  collectionId: ICollection["id"],
  bbox: BBox,
  parameters: string[],
  from: string | null,
  to: string | null,
  csv: boolean = false,
  format: boolean = true,
): string => {
  const url = new URL(
    `${import.meta.env.VITE_WWDH_UNCACHE_SOURCE}/collections/${collectionId}/cube`,
  );
  url.searchParams.set("bbox", normalizeBBox(bbox).join(","));

  if (format) {
    url.searchParams.set("f", csv ? "csv" : "json");
  }

  if (parameters.length > 0) {
    url.searchParams.set("parameter-name", parameters.join(","));
  }

  const datetime = getDatetime(from, to);

  if (datetime) {
    url.searchParams.set("datetime", datetime);
  }

  return url.toString();
};
