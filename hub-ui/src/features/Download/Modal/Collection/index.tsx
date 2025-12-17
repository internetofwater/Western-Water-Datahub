/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useEffect, useState } from "react";
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
import mainManager from "@/managers/Main.init";
import { ICollection } from "@/services/edr.service";
import useMainStore from "@/stores/main";
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

  const from = useMainStore((state) => state.from);
  const to = useMainStore((state) => state.to);
  const layer = useMainStore((state) => state.layers).find(
    (layer) => layer.collectionId === collectionId,
  );

  const [collection, setCollection] = useState<ICollection>();
  const [parameterNameOptions, setParameterNameOptions] =
    useState<ComboboxData>();
  const [localParameters, setLocalParameters] = useState<string[]>(
    layer?.parameters ?? [],
  );
  const [localFrom, setLocalFrom] = useState<string | null>(from);
  const [localTo, setLocalTo] = useState<string | null>(to);
  const [renderedCount, setRenderedCount] = useState(0);
  const [startDownload, setStartDownload] = useState<number>();

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);

    if (collection) {
      setCollection(collection);
    }
  }, [collectionId]);

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
    localFrom && localTo
      ? dayjs(localFrom).isSameOrBefore(dayjs(localTo))
      : true;
  const isParameterSelectionUnderLimit =
    localParameters.length <= PARAMETER_LIMIT;
  const areParametersSelected = localParameters.length > 0;

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
    <>
      {collection && (
        <Box p="var(--default-spacing)">
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
            <Stack mt="sm" gap="calc(var(--default-spacing) * 2)">
              <Group
                justify="space-between"
                align="flex-start"
                grow
                gap="var(--default-spacing)"
                mb="lg"
              >
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
                      value={localParameters}
                      onChange={setLocalParameters}
                      searchable
                      clearable
                      error={
                        isParameterSelectionUnderLimit
                          ? false
                          : `Please remove ${localParameters.length - PARAMETER_LIMIT} parameter${localParameters.length - PARAMETER_LIMIT > 1 ? "s" : ""}`
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
                    value={localFrom}
                    onChange={setLocalFrom}
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
                    value={localTo}
                    onChange={setLocalTo}
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
                    localParameters,
                    localFrom,
                    localTo,
                  );

                  return (
                    <Stack
                      gap="calc(var(--default-spacing) / 2)"
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
                        parameters={localParameters}
                        from={localFrom}
                        to={localTo}
                        onData={() => setRenderedCount((count) => count + 1)}
                      />
                      <Group grow gap="sm">
                        <CSV
                          instanceId={startDownload}
                          collectionId={collectionId}
                          locationId={locationId}
                          parameters={localParameters}
                          from={localFrom}
                          to={localTo}
                        />
                        <Box className={styles.copyInputWrapper}>
                          <CopyInput url={url} />
                        </Box>
                      </Group>
                    </Stack>
                  );
                })}
            </Stack>
          </Collapse>
        </Box>
      )}
    </>
  );
};

export default Collection;
