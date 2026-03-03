/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import X from "@/assets/X";
import Tooltip from "@/components/Tooltip";
import { useMap } from "@/contexts/MapContexts";
import { MAP_ID } from "@/features/Map/config";
import ParameterSelect from "@/features/Panel/Datasources/ParameterSelect";
import styles from "@/features/Panel/Panel.module.css";
import { showParameterSelect } from "@/features/Panel/utils";
import { useValidation } from "@/hooks/useValidation";
import loadingManager from "@/managers/Loading.init";
import mainManager from "@/managers/Main.init";
import notificationManager from "@/managers/Notification.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
import { ELoadingType, ENotificationType } from "@/stores/session/types";

type Props = {
  collectionId: ICollection["id"];
};

export const Datasource: React.FC<Props> = (props) => {
  const { collectionId } = props;

  const geographyFilterItemId = useMainStore(
    (state) => state.geographyFilter?.itemId,
  );

  const [collection, setCollection] = useState<ICollection>();
  const [isLoading, setIsLoading] = useState(false);
  const [includeGeography, setIncludeGeography] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const isMounted = useRef(true);

  const { isCollectionValid, hasGeoFilterRestrictions } =
    useValidation(collectionId);

  const { persistentPopup } = useMap(MAP_ID);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);

    setCollection(collection);
  }, [collectionId]);

  useEffect(() => {
    if (!geographyFilterItemId && !hasGeoFilterRestrictions()) {
      setIncludeGeography(false);
    }
  }, [geographyFilterItemId]);

  useEffect(() => {
    if (hasGeoFilterRestrictions()) {
      setIncludeGeography(true);
    }
  }, [hasGeoFilterRestrictions]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleUpdate = async () => {
    if (!collection) {
      return;
    }

    // User has a popup open that may not be relevant any longer
    if (persistentPopup && persistentPopup.isOpen()) {
      persistentPopup.remove();
    }

    const loadingInstance = loadingManager.add(
      "Fetching Locations",
      ELoadingType.Locations,
    );
    try {
      setIsLoading(true);
      await mainManager.createLayer(collection, includeGeography);
      // TODO: Move to shared location
      // if (isFirstTime.current) {
      //   isFirstTime.current = false;
      //   setOpenTools(ETool.Legend, true);
      // }
      notificationManager.show("Done fetching data", ENotificationType.Success);
    } catch (error) {
      if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
          10000,
        );
      }
    } finally {
      loadingManager.remove(loadingInstance);
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleFilter = () => {
    setIncludeGeography(!includeGeography);
  };

  const handleError = (hasError: boolean) => {
    setIsDisabled(hasError);
  };

  const handleDelete = () => {
    if (!collection) {
      return;
    }

    mainManager.deleteLayer(collection.id);
  };

  if (!collection) {
    return null;
  }

  return (
    <Stack>
      <Group
        gap="calc(var(--default-spacing) / 2)"
        justify="space-between"
        align="center"
      >
        <Title order={3} size="h4" className={styles.datasourceTitle}>
          {collection.title}
        </Title>
        <Tooltip label="Remove datasource">
          <ActionIcon
            size="sm"
            aria-label="Remove datasource"
            variant="transparent"
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            <X />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group
        gap="calc(var(--default-spacing) / 2)"
        justify="space-between"
        align="flex-start"
      >
        <Box className={styles.datasourceLeft}>
          <ParameterSelect collection={collection} onError={handleError} />
        </Box>
        <Stack
          gap="calc(var(--default-spacing) / 2)"
          align="flex-start"
          pt={showParameterSelect(collection.id) ? "1.5625rem" : undefined}
        >
          <Button
            onClick={() => void handleUpdate()}
            disabled={!isCollectionValid || isDisabled || isLoading}
            className={styles.datasourceUpdate}
          >
            Update
          </Button>
          <Switch
            size="xs"
            classNames={{
              root: styles.switchRoot,
              track: styles.switchTrack,
              label: styles.switchLabel,
            }}
            disabled={hasGeoFilterRestrictions() || !geographyFilterItemId}
            label="Apply Geography"
            checked={includeGeography}
            onChange={handleFilter}
          />
        </Stack>
      </Group>
    </Stack>
  );
};
