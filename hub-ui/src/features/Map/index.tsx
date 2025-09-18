/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import Map from "@/components/Map";
import { basemaps } from "@/components/Map/consts";
import CustomControl from "@/components/Map/tools/CustomControl";
import { BasemapId } from "@/components/Map/types";
import { useMap } from "@/contexts/MapContexts";
import { layerDefinitions, MAP_ID } from "@/features/Map/config";
import { sourceConfigs } from "@/features/Map/sources";
import { MapButton as Legend } from "@/features/Map/Tools/Legend/Button";
import { getSelectedColor } from "@/features/Map/utils";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { groupLocationIdsByCollection } from "@/utils/groupLocationsByCollection";

const INITIAL_CENTER: [number, number] = [-98.5795, 39.8282];
const INITIAL_ZOOM = 4;

type Props = {
  accessToken: string;
};

/**
 * This component renders the main map for the application, allowing users to interact with all layers defined in config.tsx.
 * It handles all map events that interact with global state.
 *
 * Props:
 * - accessToken: string - The access token for the map service.
 *
 * @component
 */
const MainMap: React.FC<Props> = (props) => {
  const { accessToken } = props;

  const locations = useMainStore((state) => state.locations);
  const collections = useMainStore((state) => state.collections);

  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const [shouldResize, setShouldResize] = useState(false);

  const { map, hoverPopup } = useMap(MAP_ID);

  const isMounted = useRef(true);
  const initialMapLoad = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }

    mainManager.setMap(map);

    if (initialMapLoad.current) {
      map.resize();
      map.fitBounds(
        [
          [-125, 24], // Southwest corner (California/Baja)
          [-96.5, 49], // Northeast corner (MN/ND border)
        ],
        {
          padding: 50,
          animate: false,
        },
      );
      initialMapLoad.current = false;
    }
  }, [map]);

  useEffect(() => {
    if (!hoverPopup) {
      return;
    }

    mainManager.setPopup(hoverPopup);
  }, [hoverPopup]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const locationsByCollection = groupLocationIdsByCollection(locations);
    collections.forEach((collection) => {
      const { pointLayerId, lineLayerId } = mainManager.getLocationsLayerIds(
        collection.id,
      );

      const locationIds = locationsByCollection[collection.id] ?? [];
      let color;
      if (map.getLayer(pointLayerId)) {
        color = map.getPaintProperty(pointLayerId, "circle-color") as string;
        map.setPaintProperty(
          pointLayerId,
          "circle-stroke-color",
          getSelectedColor(locationIds),
        );
      }
      if (map.getLayer(lineLayerId)) {
        map.setPaintProperty(
          lineLayerId,
          "line-color",
          getSelectedColor(locationIds, color),
        );
      }
    });
  }, [locations]);

  useEffect(() => {
    setShouldResize(loadingInstances.length > 0);
  }, [loadingInstances]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.resize();
  }, [shouldResize]);

  //   TODO: uncomment when basemap selector is implemented
  //   useEffect(() => {
  //     if (!map) {
  //       return;
  //     }

  //     // Copy over all existing layers and sources when changing basemaps
  //     const layers = map.getStyle().layers || [];
  //     const sources = map.getStyle().sources || {};

  //     const customLayers = layers.filter((layer) => {
  //       return !layer.id.startsWith('mapbox');
  //     });

  //     const customSources = Object.entries(sources).filter(([id]) => {
  //       return !id.startsWith('mapbox');
  //     });

  //     map.once('styledata', () => {
  //       for (const [id, source] of customSources) {
  //         if (!map.getSource(id)) {
  //           map.addSource(id, source);
  //         }
  //       }

  //       for (const layer of customLayers) {
  //         if (!map.getLayer(layer.id)) {
  //           map.addLayer(layer);
  //         }
  //       }
  //     });
  //     map.setStyle(basemaps[basemap]);
  //   }, [basemap]);

  return (
    <>
      <Map
        accessToken={accessToken}
        id={MAP_ID}
        sources={sourceConfigs}
        layers={layerDefinitions}
        options={{
          style: basemaps[BasemapId.Streets],
          projection: "mercator",
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          maxZoom: 20,
        }}
        controls={{
          scaleControl: true,
          navigationControl: true,
        }}
        customControls={[
          {
            control: new CustomControl(<Legend />),
            position: "top-right",
          },
        ]}
      />
    </>
  );
};

export default MainMap;
