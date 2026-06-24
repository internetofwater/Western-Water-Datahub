/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Button,
    ComboboxItem,
    Group,
    Stack,
    Switch,
    Title,
    Text,
    Tooltip,
    Box,
} from '@mantine/core';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import {
    ReportService,
    TCallbackResponse,
} from '@/services/report/report.service';
import { useEffect, useRef, useState } from 'react';
import { Map, ScaleControl } from 'mapbox-gl';
import { Feature, Point } from 'geojson';
import styles from '@/features/Reservoirs/Report/Report.module.css';
import { Filters, OrganizedProperties } from '@/features/Reservoirs/types';
import { formatOptions } from '@/features/Reservoirs/Filter/Selectors/utils';
import { useLoading } from '@/hooks/useLoading';
import Select from '@/components/Select';
import { MAX_POSITIONS } from '@/services/report/report.consts';
import { getKey } from '@/features/Reservoirs/utils';
import notificationManager from '@/managers/Notification.init';
import { LoadingType, NotificationType } from '@/stores/session/types';
import loadingManager from '@/managers/Loading.init';
import Info from '@/icons/Info';
import { TooltipDetail } from '@/features/Reservoirs/Report/TooltipDetail';
import useMainStore from '@/stores/main';

type Props = {
    accessToken: string;
    reservoirs: Feature<Point, OrganizedProperties>[];
    pickFromTable: boolean;
    onPickFromTableChange: (pickFromTable: boolean) => void;
    freezeSelection: boolean;
    onFreezeSelectionChange: (freezeSelection: boolean) => void;
    selectedReservoirs: string[];
    onSelectedReservoirsChange: (selectedReservoirs: string[]) => void;
    filters: Filters;
};

const Report: React.FC<Props> = (props) => {
    const {
        accessToken,
        reservoirs,
        pickFromTable,
        onPickFromTableChange,
        freezeSelection,
        onFreezeSelectionChange,
        selectedReservoirs,
        onSelectedReservoirsChange,
        filters,
    } = props;

    const reservoirDate = useMainStore((state) => state.reservoirDate);

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const [options, setOptions] = useState<ComboboxItem[]>([]);

    const cloneMap = useRef<Map>(null);

    const { map } = useMap(MAP_ID);

    const { isFetchingReservoirs, isGeneratingReport } = useLoading();

    const createReport = (
        map: Map,
        features: Feature<Point, OrganizedProperties>[],
        loadingInstance: string
    ) => {
        const callback = (response: TCallbackResponse) => {
            const { success, message } = response;

            if (success) {
                notificationManager.show(
                    message,
                    NotificationType.Success,
                    5000
                );
            } else {
                notificationManager.show(message, NotificationType.Error, 7500);
            }
            loadingManager.remove(loadingInstance);
        };

        new ReportService().report(map, features, reservoirDate, callback);
    };

    const handleClick = () => {
        if (!map || !cloneMap.current || !isMapLoaded) {
            return;
        }

        if (isGeneratingReport || isFetchingReservoirs) {
            return;
        }

        const loadingInstance = loadingManager.add(
            'Generating Reservoirs Report.',
            LoadingType.Report
        );

        const selectionSet = new Set(selectedReservoirs);

        const features: typeof reservoirs = [];
        for (const reservoir of reservoirs) {
            const key = `${String(reservoir.id)}_${
                reservoir.properties.sourceId
            }`;
            if (selectionSet.has(key)) {
                features.push(reservoir);

                // Stop early if we are already at the limit
                if (features.length === MAX_POSITIONS) {
                    break;
                }
            }
        }

        cloneMap.current.setStyle(map.getStyle());
        createReport(cloneMap.current, features, loadingInstance);
    };

    useEffect(() => {
        const newOptions = formatOptions(
            reservoirs,
            (feature) => getKey(feature),
            (feature) => feature.properties.name,
            { defaultLabel: '', defaultValue: '', noDefault: true, sort: false }
        );

        if (pickFromTable) {
            const hiddenOptions = options.filter(
                (option) =>
                    selectedReservoirs.includes(option.value) &&
                    !newOptions.some(
                        (newOption) => newOption.value === option.value
                    )
            );

            newOptions.push(...hiddenOptions);
        }

        setOptions(newOptions);
    }, [reservoirs]);

    useEffect(() => {
        if (freezeSelection) {
            return;
        }

        const newSelection = options
            .slice(0, MAX_POSITIONS)
            .map((option) => option.value);
        onSelectedReservoirsChange(newSelection);
    }, [options]);

    useEffect(() => {
        if (!map) {
            return;
        }

        let isMounted = true;

        const hidden = document.createElement('div');
        hidden.style.width = '0';
        hidden.style.height = '0';
        hidden.style.overflow = 'hidden';

        document.body.appendChild(hidden);

        const container = document.createElement('div');
        // Aspect ratio of 1 h : 1.29 w to match a landscape 8.5" h : 11" w physical letter page
        container.style.width = '1165px';
        container.style.height = '900px';
        hidden.appendChild(container);
        cloneMap.current = new Map({
            accessToken: accessToken,
            container: container,
            center: map.getCenter(),
            style: map.getStyle(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
            projection: map.getProjection(),
            preserveDrawingBuffer: true,
        });

        // Add scale control
        cloneMap.current.addControl(new ScaleControl());

        // loadTeacups(cloneMap.current);
        cloneMap.current.once('load', () => {
            if (isMounted) {
                setIsMapLoaded(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [map]);

    // const filter: OptionsFilter = ({ options }) => {
    //     return (options as ComboboxItem[]).filter((option) =>
    //         reservoirs.some((reservoir) => getKey(reservoir) === option.value)
    //     );
    // };

    const areControlsDisabled = isFetchingReservoirs || isGeneratingReport;
    const isButtonDisabled = areControlsDisabled || !isMapLoaded;

    const labelsSwitchProps = areControlsDisabled
        ? { 'data-disabled': true }
        : {};

    return (
        <Accordion
            classNames={{
                root: styles.root,
                content: styles.content,
                control: styles.control,
            }}
        >
            <AccordionItem value={'report-content'}>
                <AccordionControl>
                    <Title order={3} size="h6">
                        Report
                    </Title>
                </AccordionControl>
                <AccordionPanel>
                    <Stack gap={'var(--default-spacing)'}>
                        <Select
                            size="xs"
                            className={styles.select}
                            classNames={{
                                root: styles.select,
                                input: styles.input,
                                pill: styles.pill,
                                pillsList: styles.pillsList,
                            }}
                            label="Reservoirs"
                            multiple
                            placeholder="Select..."
                            data={options}
                            value={selectedReservoirs}
                            // filter={filter}
                            onChange={onSelectedReservoirsChange}
                            onFocus={() => onFreezeSelectionChange(true)}
                            onDropdownOpen={() => onFreezeSelectionChange(true)}
                            disabled={areControlsDisabled}
                        />
                        <Group justify="space-between">
                            <Text size="xs">
                                {selectedReservoirs.length} / {MAX_POSITIONS}{' '}
                                reservoir(s)
                            </Text>
                            {freezeSelection ? (
                                <Text size="xs">
                                    Custom reservoir selection.
                                </Text>
                            ) : (
                                <Tooltip
                                    label={<TooltipDetail filters={filters} />}
                                    multiline
                                    position="top-start"
                                >
                                    <Text size="xs">
                                        Why are these reservoirs selected?
                                        <Box
                                            ml="calc(var(--default-spacing) / 2)"
                                            component="span"
                                            className={styles.labelIcon}
                                        >
                                            <Info />
                                        </Box>
                                    </Text>
                                </Tooltip>
                            )}
                        </Group>
                        <Group
                            justify="space-between"
                            gap={'var(--default-spacing)'}
                        >
                            <Stack
                                gap={'var(--default-spacing)'}
                                align="flex-start"
                            >
                                <Switch
                                    size="xs"
                                    mt="calc(var(--default-spacing) / 2)"
                                    disabled={
                                        areControlsDisabled || pickFromTable
                                    }
                                    classNames={{ label: styles.label }}
                                    label={
                                        <Tooltip
                                            label="Manually select reservoirs to show in the report"
                                            multiline
                                            position="top-start"
                                        >
                                            {/*  */}
                                            <Text size="xs" mt="-0.125rem">
                                                Freeze selection
                                                <Box
                                                    ml="calc(var(--default-spacing) / 2)"
                                                    component="span"
                                                    className={styles.labelIcon}
                                                >
                                                    <Info />
                                                </Box>
                                            </Text>
                                        </Tooltip>
                                    }
                                    checked={freezeSelection}
                                    onClick={(event) =>
                                        onFreezeSelectionChange(
                                            event.currentTarget.checked
                                        )
                                    }
                                    {...labelsSwitchProps}
                                />
                                <Switch
                                    size="xs"
                                    mt="calc(var(--default-spacing) / 2)"
                                    disabled={areControlsDisabled}
                                    classNames={{ label: styles.label }}
                                    label="Select reservoirs from the table"
                                    checked={pickFromTable}
                                    onClick={(event) =>
                                        onPickFromTableChange(
                                            event.currentTarget.checked
                                        )
                                    }
                                    {...labelsSwitchProps}
                                />
                            </Stack>
                            <Button
                                onClick={handleClick}
                                disabled={isButtonDisabled}
                                data-disabled={isButtonDisabled}
                            >
                                Generate
                            </Button>
                        </Group>
                    </Stack>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

export default Report;
