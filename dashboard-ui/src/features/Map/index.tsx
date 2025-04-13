/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

"use client";

import Map from "@/components/Map";
import React, { useEffect } from "react";
import {
  layerDefinitions,
  sourceConfigs,
  MAP_ID,
  BASEMAP,
  SubLayerId,
  LayerId,
} from "@/features/Map/config";
import { useMap } from "@/contexts/MapContexts";
import useMainStore from "@/lib/main";
import { loadTeacups as loadImages } from "@/features/Map/utils";

const INITIAL_CENTER: [number, number] = [-98.5795, 39.8282];
const INITIAL_ZOOM = 4;

type Props = {
  accessToken: string;
};

/**
 * This component renders the main map for the application, allowing users to interact with all layers defined in config.tsx.
 * It handles all map events that interact with redux state, including clicks on mainstem and updates to the data in the cluster layer.
 *
 * Props:
 * - accessToken: string - The access token for the map service.
 *
 * @component
 */
const MainMap: React.FC<Props> = (props) => {
  const { accessToken } = props;

  const { map } = useMap(MAP_ID);
  const region = useMainStore((state) => state.region);
  const setRegion = useMainStore((state) => state.setRegion);
  const reservoir = useMainStore((state) => state.reservoir);
  const setReservoir = useMainStore((state) => state.setReservoir);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on("click", SubLayerId.RegionsFill, (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [SubLayerId.RegionsFill],
      });

      if (features && features.length) {
        const feature = features[0];

        if (feature.properties) {
          const region = feature.properties.REGION as string;

          setRegion(region);
        }
      }
    });

    map.on("click", SubLayerId.BasinsFill, (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [SubLayerId.BasinsFill],
      });

      console.log("BASINS", features);

      // if (features && features.length) {
      //     const feature = features[0];

      //     if (feature.properties) {
      //         const region = feature.properties.REGION as string;

      //         setRegion(region);
      //     }
      // }
    });

    map.on("click", LayerId.Reservoirs, (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [LayerId.Reservoirs],
      });

      console.log("features", features);
      if (features && features.length) {
        const feature = features[0];

        if (feature.properties) {
          const reservoir = feature.properties.locName as string;
          const region = feature.properties.region as string;

          setReservoir(reservoir);
          setRegion(region);
        }
      }
    });
    loadImages(map);
    map.on("style.load", () => {
      loadImages(map);
    });
  }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (region === "all") {
      // Unset Filter
      map.setFilter(SubLayerId.RegionsFill, null);
      map.setFilter(SubLayerId.RegionsBoundary, null);
      // TODO: basin filter
      if (reservoir === "all") {
        map.setFilter(LayerId.Reservoirs, null);
        map.setFilter(LayerId.Reservoirs, null);
      }
    } else {
      map.setFilter(SubLayerId.RegionsFill, ["==", ["get", "REGION"], region]);
      map.setFilter(SubLayerId.RegionsBoundary, [
        "==",
        ["get", "REGION"],
        region,
      ]);
      // TODO: basin filter
      if (reservoir === "all") {
        map.setFilter(LayerId.Reservoirs, ["==", ["get", "region"], region]);
        map.setFilter(LayerId.Reservoirs, ["==", ["get", "region"], region]);
      }
    }
  }, [region]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (reservoir === "all") {
      // Unset Filter
      map.setFilter(LayerId.Reservoirs, null);
      map.setFilter(LayerId.Reservoirs, null);
    } else {
      map.setFilter(LayerId.Reservoirs, ["==", ["get", "locName"], reservoir]);
      map.setFilter(LayerId.Reservoirs, ["==", ["get", "locName"], reservoir]);
    }
  }, [reservoir]);

  return (
    <>
      <Map
        accessToken={accessToken}
        id={MAP_ID}
        sources={sourceConfigs}
        layers={layerDefinitions}
        options={{
          style: BASEMAP,
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          maxZoom: 20,
        }}
        controls={{
          scaleControl: true,
          navigationControl: true,
        }}
      />
    </>
  );
};

export default MainMap;
