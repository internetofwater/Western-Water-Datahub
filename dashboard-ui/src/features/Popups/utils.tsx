/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Feature, Point } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import { MantineProvider } from '@mantine/core';
import { ReservoirPopup } from '@/features/Popups/Reservoirs';
import { Map, MapMouseEvent, Popup } from 'mapbox-gl';
import { Root } from 'react-dom/client';
import { getReservoirIdentifier } from '@/features/Map/utils';

export const showReservoirPopup = (
    config: ReservoirConfig,
    map: Map,
    e: MapMouseEvent,
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
