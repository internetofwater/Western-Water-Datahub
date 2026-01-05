/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Feature } from "geojson";
import { Stack } from "@mantine/core";
import { StringIdentifierCollections } from "@/consts/collections";
import { Grid } from "@/features/Popup/Grid";
import { Header } from "@/features/Popup/Header";
import { Item } from "@/features/Popup/Item";
import { Location } from "@/features/Popup/Location";
import styles from "@/features/Popup/Popup.module.css";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import { TLayer, TLocation } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";
import { CollectionType, getCollectionType } from "@/utils/collection";
import { getIdStore } from "@/utils/getIdStore";
import { getParameterUnit } from "@/utils/parameters";

export type Parameter = {
  name: string;
  unit: string;
  id: string;
};

type Props = {
  locations: TLocation[];
  features: Feature[];
  close: () => void;
};

const Popup: React.FC<Props> = (props) => {
  const { locations, features } = props;

  const [location, setLocation] = useState<TLocation>(locations[0]);
  const [feature, setFeature] = useState<Feature>();
  const [collectionType, setCollectionType] = useState<CollectionType>(
    CollectionType.Unknown,
  );

  const [layer, setLayer] = useState<TLayer | null>(null);
  const [datasetName, setDatasetName] = useState<string>("");
  const [parameters, setParameters] = useState<Parameter[]>([]);

  const [id, setId] = useState<string>(location.id);

  const setLinkLocation = useSessionStore((state) => state.setLinkLocation);
  const allParameters =
    useMainStore((state) => state.layers).find(
      (layer) => layer.collectionId === location.collectionId,
    )?.parameters ?? [];
  const setOverlay = useSessionStore((state) => state.setOverlay);

  useEffect(() => {
    const location = locations[0];
    if (location) {
      setLocation(location);
    }
  }, [locations]);

  useEffect(() => {
    if (
      feature &&
      (feature.id === location.id || getIdStore(feature) === location.id)
    ) {
      return;
    }

    const newFeature = features.find(
      (feature) =>
        String(feature.id) === location.id ||
        getIdStore(feature) === location.id,
    );

    if (newFeature) {
      setFeature(newFeature);
    }
  }, [location]);

  useEffect(() => {
    const newDataset = mainManager.getCollection(location.collectionId);

    if (newDataset) {
      setDatasetName(newDataset.title ?? "");
      const paramObjects = Object.values(newDataset?.parameter_names ?? {});

      const parameters = paramObjects
        .filter(
          (object) =>
            object.type === "Parameter" && allParameters.includes(object.id),
        )
        .map((object) => ({
          id: object.id,
          name: object.name,
          unit: getParameterUnit(object),
        }));

      setParameters(parameters);

      const collectionType = getCollectionType(newDataset);
      setCollectionType(collectionType);
    }
  }, [location]);

  useEffect(() => {
    const newLayer = mainManager.getLayer({
      collectionId: location.collectionId,
    });
    if (newLayer) {
      setLayer(newLayer);
    }
  }, [location]);

  useEffect(() => {
    if (
      feature &&
      StringIdentifierCollections.includes(location.collectionId)
    ) {
      const id = getIdStore(feature);
      if (id) {
        setId(id);
      } else {
        setId(location.id);
      }
    } else {
      setId(location.id);
    }
  }, [location, feature]);

  const handleLinkClick = () => {
    setLinkLocation(location);
    setOverlay(EOverlay.Download);
  };

  const handleLocationChange = (id: string | null) => {
    const location = locations.find((location) => location.id === id);
    if (location) {
      setLocation(location);
    }
  };

  if (!layer) {
    return null;
  }

  return (
    <Stack gap={0} className={styles.popupWrapper}>
      <Header
        id={id}
        name={datasetName}
        feature={feature}
        collectionType={collectionType}
      />

      {collectionType === CollectionType.EDR &&
        feature &&
        datasetName.length > 0 && (
          <Location
            location={location}
            locations={locations}
            layer={layer}
            feature={feature}
            datasetName={datasetName}
            parameters={parameters}
            handleLocationChange={handleLocationChange}
            handleLinkClick={handleLinkClick}
          />
        )}
      {collectionType === CollectionType.EDRGrid &&
        feature &&
        datasetName.length > 0 && (
          <Grid
            location={location}
            locations={locations}
            layer={layer}
            feature={feature}
            datasetName={datasetName}
            parameters={parameters}
            handleLocationChange={handleLocationChange}
            handleLinkClick={handleLinkClick}
          />
        )}
      {collectionType === CollectionType.Features && feature && (
        <Item
          location={location}
          locations={locations}
          feature={feature}
          handleLocationChange={handleLocationChange}
          handleLinkClick={handleLinkClick}
        />
      )}
    </Stack>
  );
};

export default Popup;
