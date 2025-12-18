/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Button, Text, Tooltip } from "@mantine/core";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { EOverlay, EModal as ModalEnum } from "@/stores/session/types";
import { CollectionType, getCollectionType } from "@/utils/collection";

const Download: React.FC = () => {
  const layers = useMainStore((state) => state.layers);
  const setLocations = useMainStore((state) => state.setLocations);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const [isEnabled, setIsEnabled] = useState(false);

  const hasLayers = layers.length > 0;

  const helpDownloadText = (
    <>
      <Text size="sm">
        Explore locations in greater detail. Find request urls, search
        locations, and download data.
      </Text>
      <br />
      <Text size="sm">
        At least one layer must have viable locations and parameters selected.
      </Text>
    </>
  );

  useEffect(() => {
    const isEnabled = layers.some((layer) => {
      const datasource = mainManager.getCollection(layer.collectionId);
      if (datasource) {
        const collectionType = getCollectionType(datasource);
        if (collectionType === CollectionType.Features) {
          return true;
        } else if (
          [CollectionType.EDR, CollectionType.EDRGrid].includes(collectionType)
        ) {
          return layer.parameters.length > 0;
        }
      }
      return false;
    });
    setIsEnabled(isEnabled);
  }, [layers]);

  return (
    <>
      {hasLayers && (
        <>
          <Tooltip label={helpDownloadText}>
            <Button
              disabled={!isEnabled}
              data-disabled={!isEnabled}
              onClick={() => setOverlay(EOverlay.Download)}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip label="Deselect all selected locations">
            <Button onClick={() => setLocations([])} color="red-rocks">
              Clear selection
            </Button>
          </Tooltip>
        </>
      )}
    </>
  );
};

export default Download;
