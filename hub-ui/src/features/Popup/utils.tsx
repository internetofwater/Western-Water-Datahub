/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { center } from '@turf/turf';
import { Feature } from 'geojson';
import { Map, MapMouseEvent, Popup as PopupType } from 'mapbox-gl';
import { Root } from 'react-dom/client';
import Popup from '@/features/Popup';
import { Mantine as MantineProvider } from '@/providers/Mantine';
import { TLocation } from '@/stores/main/types';

export const showGraphPopup = (
  locations: TLocation[],
  map: Map,
  e: MapMouseEvent,
  root: Root,
  container: HTMLDivElement,
  persistentPopup: PopupType,
  checkIdentifier = false
) => {
  if (e.features && e.features.length > 0 && locations.length > 0) {
    const features = e.features as Feature[];

    const identifier = String(locations[0].id);
    const currentIdentifier = container.getAttribute('data-identifier');
    // Dont recreate the same popup for the same feature
    if (!checkIdentifier || identifier !== currentIdentifier) {
      container.setAttribute('data-identifier', identifier);

      const close = () => {
        persistentPopup.remove();
      };

      root.render(
        <MantineProvider>
          <Popup close={close} locations={locations} features={features} />
        </MantineProvider>
      );

      const feature = features[0];

      const centerPoint = (
        feature.geometry.type === 'Point'
          ? feature.geometry.coordinates
          : center(feature).geometry.coordinates
      ) as [number, number];
      persistentPopup
        .setLngLat(centerPoint)
        .setDOMContent(container)
        .setMaxWidth('fit-content')
        .addTo(map);
    }
  }
};
