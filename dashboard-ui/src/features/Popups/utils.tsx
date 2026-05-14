/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Feature, GeoJsonProperties, Geometry, Point } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import { MantineProvider } from '@mantine/core';
import { ReservoirPopup } from '@/features/Popups/Reservoirs';
import { Map, MapMouseEvent, MapTouchEvent, Popup } from 'mapbox-gl';
import { Root } from 'react-dom/client';
import { getReservoirIdentifier } from '@/features/Map/utils';
import { SnotelProperties, SnotelField } from '@/features/Map/types/snotel';
import { SnotelPopup } from '@/features/Popups/Snotel';

export const showReservoirPopup = (
    config: ReservoirConfig,
    map: Map,
    e: MapMouseEvent | MapTouchEvent,
    root: Root,
    container: HTMLDivElement,
    hoverPopup: Popup,
    checkIdentifier = false
) => {
    if (e.features && e.features.length > 0) {
        const feature = e.features[0] as Feature<Point>;

        if (feature.properties) {
            const identifier = String(
                getReservoirIdentifier(config, feature.properties, feature.id!)
            );
            const currentIdentifier = container.getAttribute('data-identifier');
            // Dont recreate the same popup for the same feature
            if (!checkIdentifier || identifier !== currentIdentifier) {
                container.setAttribute('data-identifier', identifier);

                root.render(
                    <MantineProvider defaultColorScheme="auto">
                        <ReservoirPopup
                            config={config}
                            reservoirProperties={feature.properties}
                        />
                    </MantineProvider>
                );

                const center = feature.geometry.coordinates as [number, number];
                hoverPopup
                    .setLngLat(center)
                    .setDOMContent(container)
                    .setMaxWidth('fit-content')
                    .addTo(map);
            }
        }
    }
};

export const showSnotelPopup = (
    map: Map,
    root: Root,
    container: HTMLDivElement,
    persistentPopup: Popup,
    feature: Feature<Point, SnotelProperties>
) => {
    const state = feature.properties[SnotelField.StateCode];
    const name = feature.properties[SnotelField.Name];
    const url = `https://nwcc-apps.sc.egov.usda.gov/awdb/site-plots/POR/WTEQ/${state}/${name}.html?hideAnno=true&hideControls=true&activeOnly=true&showYears=2025`;
    // const response = await fetch(url);

    // const htmlText = await response.text();

    root.render(
        <MantineProvider defaultColorScheme="auto">
            <SnotelPopup html={url} />
        </MantineProvider>
    );

    const center = feature.geometry.coordinates as [number, number];
    persistentPopup
        .setLngLat(center)
        .setDOMContent(container)
        .setMaxWidth('fit-content')
        .addTo(map);
};

const getElemPixelSize = () => {
    const remSize = getComputedStyle(document.documentElement).fontSize;

    switch (remSize) {
        case '12px':
            return 12;
        case '14px':
            return 14;
        default:
        case '16px':
            return 16;
    }
};

const yInHoverSpace = (y: number, height: number): boolean => {
    // Using bottom css value as defined in Main.module.css
    const buffer = getElemPixelSize() * 2.25;
    const elemHeight = 235;
    const upper = height - buffer;
    const lower = upper - elemHeight;

    return y <= upper && y >= lower;
};

const xInHoverSpace = (x: number, width: number): boolean => {
    // Using left css value as defined in Main.module.css
    const buffer = getElemPixelSize() * 0.5;
    const elemWidth = 620;
    const left = width + buffer;
    const right = left + elemWidth;

    return x >= left && x <= right;
};

export const checkIsInHoverSpace = (
    event: MapMouseEvent | MapTouchEvent,
    map: Map
): boolean => {
    const container = map.getContainer();
    const { x, y } = event.point;

    const { offsetHeight: height } = container;

    // Screen position starts in top left, since popup is left-aligned, use 0
    return xInHoverSpace(x, 0) && yInHoverSpace(y, height);
};

export const getTopFeatureByProperty = <
    T extends Geometry,
    V extends GeoJsonProperties,
>(
    features: Feature<T, V>[],
    property: string
): Feature<T, V> => {
    return features.reduce((top, current) => {
        const topValue = Number(top?.properties?.[property]);
        const currentValue = Number(current?.properties?.[property]);

        return currentValue > topValue ? current : top;
    }, features[0]);
};
