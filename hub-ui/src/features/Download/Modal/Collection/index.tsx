/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Collapse,
  ComboboxData,
  Divider,
  Group,
  MultiSelect,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import Info from "@/assets/Info";
import CopyInput from "@/components/CopyInput";
import Tooltip from "@/components/Tooltip";
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
import { ELoadingType, ENotificationType } from "@/stores/session/types";
import { DatePreset, getSimplePresetDates } from "@/utils/dates";

dayjs.extend(isSameOrBefore);

type Props = {
  collectionId: ICollection["id"];
  locationIds: string[];
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
  const [from, setFrom] = useState<string | null>(
    dayjs().subtract(1, "week").format("YYYY-MM-DD"),
  );
  const [to, setTo] = useState<string | null>(dayjs().format("YYYY-MM-DD"));
  const [renderedCount, setRenderedCount] = useState(0);
  const [startDownload, setStartDownload] = useState<number>();

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const loadingInstance = useRef<string>(null);

  const getBasinOptions = async () => {
    loadingInstance.current = loadingManager.add(
      `Fetching data for collection: ${collectionId}`,
      ELoadingType.Data,
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
          ENotificationType.Error,
          10000,
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

  const isValidRange =
    from && to ? dayjs(from).isSameOrBefore(dayjs(to)) : true;
  const isParameterSelectionUnderLimit =
    selectedParameters.length <= PARAMETER_LIMIT;
  const areParametersSelected = selectedParameters.length > 0;

  const parameterHelpText = (
    <>
      <Text size="sm">
        Parameters are scientific measurements that may be available at a
        location.
      </Text>
      <br />
      <Text size="sm">
        These measurements are connected to an individual time and date.
      </Text>
    </>
  );

  const alternateLink = collection?.links?.find(
    (link) => link.rel === "alternate" && link.type === "text/html",
  )?.href;

  return (
    <Box>
      {collection && (
        <Box p="lg">
          <Group justify="space-between" mb="sm">
            {alternateLink ? (
              <Anchor href={alternateLink} target="_blank">
                <Title order={3}>{collection.title}</Title>
              </Anchor>
            ) : (
              <Title order={3}>{collection.title}</Title>
            )}
            <Button onClick={toggle}>{opened ? "Hide" : "Show"}</Button>
          </Group>
          <Collapse in={opened}>
            <Divider />
            <Stack mt="sm">
              <Group justify="space-between" align="flex-start" grow mb="lg">
                {parameterNameOptions && (
                  <>
                    <MultiSelect
                      size="sm"
                      className={styles.parameterNameSelect}
                      label={
                        <Tooltip multiline label={parameterHelpText}>
                          <Group
                            className={styles.parameterLabelWrapper}
                            gap="xs"
                          >
                            <Text component="label" size="sm">
                              Parameters&nbsp;<span>*</span>
                            </Text>
                            <Info />
                          </Group>
                        </Tooltip>
                      }
                      description="Select 1-10 parameters"
                      placeholder="Select..."
                      data={parameterNameOptions}
                      value={selectedParameters}
                      onChange={setSelectedParameters}
                      searchable
                      clearable
                      error={
                        isParameterSelectionUnderLimit
                          ? false
                          : `Please remove ${selectedParameters.length - PARAMETER_LIMIT} parameter${selectedParameters.length - PARAMETER_LIMIT > 1 ? "s" : ""}`
                      }
                    />
                    <VisuallyHidden>{parameterHelpText}</VisuallyHidden>
                  </>
                )}
                <Stack gap="xs" p={0}>
                  <DatePickerInput
                    label="From"
                    description="Provide an optional date range"
                    className={styles.datePicker}
                    placeholder="Pick start date"
                    value={from}
                    onChange={setFrom}
                    clearable
                    presets={getSimplePresetDates([
                      DatePreset.OneYear,
                      DatePreset.FiveYears,
                      DatePreset.TenYears,
                      DatePreset.FifteenYears,
                      DatePreset.ThirtyYears,
                    ])}
                    error={isValidRange ? false : "Invalid date range"}
                  />
                  <DatePickerInput
                    label="To"
                    className={styles.datePicker}
                    placeholder="Pick end date"
                    value={to}
                    onChange={setTo}
                    clearable
                    presets={getSimplePresetDates([
                      DatePreset.OneYear,
                      DatePreset.FiveYears,
                      DatePreset.TenYears,
                      DatePreset.FifteenYears,
                      DatePreset.ThirtyYears,
                    ])}
                    error={isValidRange ? false : "Invalid date range"}
                  />
                </Stack>
                <Button
                  disabled={
                    !isValidRange ||
                    !isParameterSelectionUnderLimit ||
                    !areParametersSelected
                  }
                  className={styles.goButton}
                  onClick={() => setStartDownload(Date.now())}
                >
                  Search
                </Button>
              </Group>

              {startDownload &&
                locationIds.slice(0, renderedCount + 1).map((locationId) => {
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
                      <Group gap="xs">
                        <Text>Location:</Text>
                        <Anchor
                          href={`${collection.data_queries.locations?.link?.href}/${locationId}`}
                          target="_blank"
                        >
                          {locationId}
                        </Anchor>
                      </Group>
                      <Chart
                        instanceId={startDownload}
                        collectionId={collectionId}
                        locationId={locationId}
                        parameters={selectedParameters}
                        from={from}
                        to={to}
                        onData={() => setRenderedCount((count) => count + 1)}
                      />
                      <Group grow gap="sm">
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
