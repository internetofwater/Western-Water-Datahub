/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export const getDatetime = (
    from: string | null | undefined,
    to: string | null | undefined
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

export const buildLocationUrl = (
    collectionId: string,
    locationId: string,
    parameters: Record<string, string | number | string[]>,
    from: string | null,
    to: string | null,
    csv: boolean = false,
    format: boolean = true
): string => {
    const url = new URL(
        `https://api.wwdh.internetofwater.app/collections/${collectionId}/locations/${locationId}`
    );

    if (format) {
        url.searchParams.set('f', csv ? 'csv' : 'json');
    }

    const entries = Object.entries(parameters);
    if (entries.length > 0) {
        for (const [param, value] of entries) {
            if (Array.isArray(value)) {
                url.searchParams.set(param, value.join(','));
            } else {
                url.searchParams.set(param, String(value));
            }
        }
    }

    const datetime = getDatetime(from, to);

    if (datetime) {
        url.searchParams.set('datetime', datetime);
    }

    return url.toString();
};

export const buildItemUrl = (
    collectionId: string,
    locationId: string,
    format: null | 'csv' | 'json' | 'kml' | 'shp' = null
): string => {
    const url = new URL(
        `https://api.wwdh.internetofwater.app/collections/${collectionId}/items/${locationId}`
    );

    if (format && format.length) {
        url.searchParams.set('f', format);
    }
    return url.toString();
};
