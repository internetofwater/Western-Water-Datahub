/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  ComboboxData,
  Divider,
  Group,
  MultiSelect,
  Stack,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import CopyInput from "@/components/CopyInput";
import styles from "@/features/Download/Download.module.css";
import { Chart } from "@/features/Download/Modal/Collection/Chart";
import { CSV } from "@/features/Download/Modal/Collection/CSV";
import {
  buildUrl,
  getParameterNameOptions,
} from "@/features/Download/Modal/utils";
import loadingManager from "@/managers/Loading.init";
import notificationManager from "@/managers/Notification.init";
import { ICollection } from "@/services/edr.service";
import wwdhService from "@/services/init/wwdh.init";
import { Collection as CollectionType } from "@/stores/main/types";
import { NotificationType } from "@/stores/session/types";

type Props = {
  collectionId: CollectionType["id"];
  locationIds: (string | number)[];
  open?: boolean;
};

const PARAMETER_LIMIT = 10;

const Collection: React.FC<Props> = (props) => {
  const { collectionId, locationIds, open = false } = props;

  const [opened, { toggle }] = useDisclosure(open);

  const [collection, setCollection] = useState<ICollection>();
  const [parameterNameOptions, setParameterNameOptions] =
    useState<ComboboxData>();
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [startDownload, setStartDownload] = useState<number>();

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const loadingInstance = useRef<string>(null);

  const getBasinOptions = async () => {
    loadingInstance.current = loadingManager.add(
      `Fetching data for collection: ${collectionId}`,
    );
    try {
      controller.current = new AbortController();

      const collection = await wwdhService.getCollection(collectionId, {
        signal: controller.current.signal,
      });

      if (isMounted.current) {
        setCollection(collection);
        loadingManager.remove(loadingInstance.current);
      }
    } catch (error) {
      if (
        (error as Error)?.name === "AbortError" ||
        (typeof error === "string" && error === "Component unmount")
      ) {
        console.log("Fetch request canceled");
      } else if ((error as Error)?.message) {
        notificationManager.show(
          `Error: ${(error as Error)?.message}`,
          NotificationType.Error,
        );
      }
      loadingManager.remove(loadingInstance.current);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getBasinOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  useEffect(() => {
    if (!collection) {
      return;
    }

    const parameterNameOptions = getParameterNameOptions(
      collection.parameter_names,
    );

    setParameterNameOptions(parameterNameOptions);
  }, [collection]);

  return (
    <Box>
      {collection && (
        <Box p="lg">
          <Group justify="space-between" mb="sm">
            <Title order={3}>{collection.title}</Title>
            <Button onClick={toggle}>{opened ? "Hide" : "Show"}</Button>
          </Group>
          <Divider />
          <Collapse in={opened}>
            <Stack mt="sm">
              <Group justify="space-between" align="flex-start" grow mb="lg">
                {parameterNameOptions && (
                  <MultiSelect
                    size="sm"
                    withAsterisk
                    className={styles.parameterNameSelect}
                    label="Parameters"
                    placeholder="Select..."
                    data={parameterNameOptions}
                    value={selectedParameters}
                    onChange={setSelectedParameters}
                    searchable
                    clearable
                    error={
                      selectedParameters.length > PARAMETER_LIMIT
                        ? "Please select only 10 parameters"
                        : false
                    }
                  />
                )}
                <Group grow>
                  <DatePickerInput
                    label="From"
                    className={styles.datePicker}
                    placeholder="Pick start date"
                    value={from}
                    onChange={setFrom}
                    clearable
                  />
                  <DatePickerInput
                    label="To"
                    className={styles.datePicker}
                    placeholder="Pick end date"
                    value={to}
                    onChange={setTo}
                    clearable
                  />
                </Group>
                <Button
                  disabled={
                    selectedParameters.length > PARAMETER_LIMIT ||
                    selectedParameters.length === 0
                  }
                  className={styles.goButton}
                  onClick={() => setStartDownload(Date.now())}
                >
                  Go
                </Button>
              </Group>

              {startDownload &&
                locationIds.map((locationId) => {
                  const url = buildUrl(
                    collectionId,
                    locationId,
                    selectedParameters,
                    from,
                    to,
                  );
                  return (
                    <Fragment
                      key={`collection-download-${collectionId}-${locationId}`}
                    >
                      <Chart
                        instanceId={startDownload}
                        collectionId={collectionId}
                        locationId={locationId}
                        parameters={selectedParameters}
                        from={from}
                        to={to}
                      />
                      <Group gap="sm">
                        <CSV
                          instanceId={startDownload}
                          collectionId={collectionId}
                          locationId={locationId}
                          parameters={selectedParameters}
                          from={from}
                          to={to}
                        />
                        <Box className={styles.copyInputWrapper}>
                          <CopyInput url={url} />
                        </Box>
                      </Group>
                    </Fragment>
                  );
                })}
            </Stack>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default Collection;
