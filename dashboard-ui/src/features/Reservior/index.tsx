/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */
import { useRef } from 'react';
import { ActionIcon, Divider, Group, Modal, Title, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReservoirConfig } from '@/features/Map/types';
import { SourceId } from '@/features/Map/consts';
import {
    getReservoirConfig,
    getReservoirIdentifier,
    isReservoirIdentifier,
} from '@/features/Map/utils';
import { Chart } from '@/features/Reservior/Chart';
import { Chart as ChartJS } from 'chart.js';
import Info from '@/features/Reservior/Info';
import useMainStore from '@/stores/main';
import { useDisclosure } from '@mantine/hooks';
import { ReservoirDefault } from '@/stores/main/consts';
import { GeoJsonProperties } from 'geojson';
import useSessionStore from '@/stores/session';
import { LoadingType, NotificationType, Overlay } from '@/stores/session/types';
import styles from '@/features/Reservior/Reservoir.module.css';
import wwdhService from '@/services/init/wwdh.init';
import { CoverageJSON } from '@/services/edr.service';
import dayjs from 'dayjs';
import { DateInput, DateValue } from '@mantine/dates';
import loadingManager from '@/managers/Loading.init';
import notificationManager from '@/managers/Notification.init';
import debounce from 'lodash.debounce';
import { useLoading } from '@/hooks/useLoading';
import { Properties } from '@/components/Map/types';
import Reset from '@/icons/Reset';
import { TeacupReservoirField } from '../Map/types/reservoir/teacup';

/**
 *
 * @component
 */
const Reservoir: React.FC = () => {
    const [opened, { open, close }] = useDisclosure(false);

    const reservoir = useMainStore((state) => state.reservoir);
    const reservoirCollections = useMainStore(
        (state) => state.reservoirCollections
    );
    const reservoirDate = useMainStore((state) => state.reservoirDate);

    const overlay = useSessionStore((store) => store.overlay);
    const setOverlay = useSessionStore((store) => store.setOverlay);

    const chartRef =
        useRef<ChartJS<'line', Array<{ x: string; y: number }>>>(null);

    const [initialReservoirProperties, setInitialReservoirProperties] =
        useState<GeoJsonProperties>();
    const [currentReservoirProperties, setCurrentReservoirProperties] =
        useState<GeoJsonProperties>();

    const [reservoirId, setReservoirId] = useState<string | number>();
    const [config, setConfig] = useState<ReservoirConfig>();
    const [currentDate, setCurrentDate] = useState(reservoirDate);
    const [isLocation, setIsLocation] = useState(false);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    const { isFetchingSingleReservoir } = useLoading();

    const handleDateChange = (value: DateValue) => {
        const date = dayjs(value).format('YYYY-MM-DD');
        setCurrentDate(date);
    };

    const debouncedHandleDateChange = debounce(handleDateChange, 300);

    const fetchNewDate = async () => {
        if (
            !reservoir ||
            !reservoirId ||
            !currentDate ||
            !initialReservoirProperties ||
            !config
        ) {
            return;
        }

        if (
            currentReservoirProperties &&
            currentReservoirProperties[config.storageDateProperty] ===
                currentDate
        ) {
            return;
        }

        if (config.id === SourceId.TeacupEDRReservoirs) {
            const isItem = Boolean(
                initialReservoirProperties[TeacupReservoirField.Item]
            );
            if (isItem) {
                return;
            }
        }

        const name = String(
            initialReservoirProperties[config.longLabelProperty]
        );
        const loadingInstance = loadingManager.add(
            `Fetching data for reservoir: ${name}, on date: ${dayjs(currentDate).format('MM/DD/YYYY')}`,
            LoadingType.SingleReservoir
        );

        controller.current = new AbortController();

        const coverage = await wwdhService.getLocation<CoverageJSON>(
            reservoir.source,
            String(reservoirId),
            {
                params: {
                    limit: 1,
                    datetime: currentDate,
                },
                signal: controller.current.signal,
            }
        );

        loadingManager.remove(loadingInstance);
        notificationManager.show(
            `Updated data for reservoir: ${name}, to date: ${dayjs(currentDate).format('MM/DD/YYYY')}`,
            NotificationType.Info,
            10000
        );

        const newProperties: Properties = {};

        // Set Storage
        newProperties[config.storageProperty] =
            coverage.ranges[config.storageProperty]?.values?.[0];
        // 10th Percentile
        newProperties[config.tenthPercentileProperty] =
            coverage.ranges[config.tenthPercentileProperty]?.values?.[0];
        // 90th Percentile
        newProperties[config.ninetiethPercentileProperty] =
            coverage.ranges[config.ninetiethPercentileProperty]?.values?.[0];
        // 30-year Average
        newProperties[config.thirtyYearAverageProperty] =
            coverage.ranges[config.thirtyYearAverageProperty]?.values?.[0];
        newProperties[config.storageDateProperty] =
            coverage.domain.axes.t.values?.[0] ?? currentDate;

        if (isMounted.current) {
            setCurrentReservoirProperties({
                ...initialReservoirProperties,
                ...newProperties,
            });
        }
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            debouncedHandleDateChange.cancel();
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    useEffect(() => {
        setCurrentDate(reservoirDate);
    }, [reservoirDate]);

    useEffect(() => {
        if (!reservoirCollections) {
            return;
        }

        if (reservoir !== ReservoirDefault) {
            const collection =
                reservoirCollections[reservoir.source as SourceId];

            const config = getReservoirConfig(reservoir.source as SourceId);

            if (collection && config) {
                setConfig(config);

                const features = collection.features.filter((feature) =>
                    isReservoirIdentifier(
                        config,
                        feature.properties,
                        feature.id!,
                        reservoir.identifier
                    )
                );

                if (features.length) {
                    const feature = features[0];
                    const properties = feature.properties;
                    const id = getReservoirIdentifier(
                        config,
                        feature.properties,
                        feature.id!
                    );

                    setReservoirId(id);
                    if (properties) {
                        if (config.id === SourceId.TeacupEDRReservoirs) {
                            const isLocation =
                                !properties[TeacupReservoirField.Item];
                            setIsLocation(isLocation);
                        }

                        const currentDate = properties[
                            config.storageDateProperty
                        ]
                            ? String(properties[config.storageDateProperty])
                            : dayjs().format('YYYY-MM-DD');

                        setCurrentDate(currentDate);
                    }

                    setInitialReservoirProperties(properties);
                    setCurrentReservoirProperties(properties);
                }
                open();
                setOverlay(Overlay.Detail);
            }
        }
    }, [reservoir]);

    useEffect(() => {
        void fetchNewDate();
    }, [currentDate]);

    useEffect(() => {
        if (overlay !== Overlay.Detail) {
            close();
        } else if (!opened) {
            open();
        }
    }, [overlay]);

    const handleSetToDefault = () => {
        const today = dayjs().format('YYYY-MM-DD');

        if (reservoir && initialReservoirProperties) {
            const config = getReservoirConfig(reservoir.source as SourceId);

            if (config) {
                const storedDate = initialReservoirProperties[
                    config.storageDateProperty
                ] as string | undefined;
                const finalDate = reservoirDate
                    ? reservoirDate
                    : storedDate
                      ? storedDate
                      : today;

                setCurrentDate(String(finalDate));

                if (config.id === SourceId.TeacupEDRReservoirs) {
                    const isLocation =
                        Boolean(
                            initialReservoirProperties[
                                TeacupReservoirField.Item
                            ]
                        ) === false;
                    setIsLocation(isLocation);
                }
                return;
            }
        }

        // No reservoir/config
        setCurrentDate(reservoirDate ?? today);
        setCurrentReservoirProperties(initialReservoirProperties);
    };

    const handleClose = () => {
        close();
        setOverlay(null);
    };

    if (!currentReservoirProperties || !config || !reservoirId) {
        return null;
    }

    return (
        <Modal
            centered
            size="auto"
            classNames={{ content: styles.content, body: styles.body }}
            opened={opened}
            onClose={handleClose}
            title={
                <Title order={3}>
                    {String(
                        currentReservoirProperties[config.longLabelProperty]
                    ) ?? ''}
                </Title>
            }
        >
            <>
                <Info
                    reservoirProperties={currentReservoirProperties}
                    config={config}
                />
                {isLocation && (
                    <Group gap="var(--default-spacing)" align="flex-end">
                        <DateInput
                            size="xs"
                            className={styles.dateSelector}
                            valueFormat="MM/DD/YYYY"
                            disabled={isFetchingSingleReservoir}
                            value={
                                currentDate
                                    ? dayjs(currentDate).toDate()
                                    : undefined
                            }
                            maxDate={new Date()}
                            label="Reservoir Storage Date"
                            onChange={debouncedHandleDateChange}
                        />
                        <ActionIcon
                            classNames={{ icon: styles.actionIcon }}
                            onClick={handleSetToDefault}
                        >
                            <Reset />
                        </ActionIcon>
                    </Group>
                )}

                <Divider my="var(--default-spacing)" />
                {isLocation ? (
                    <Chart
                        currentDate={currentDate}
                        id={reservoirId}
                        ref={chartRef}
                        config={config}
                    />
                ) : (
                    <Text ta={'center'} mt="14%">
                        This reservoir has no storage measurements available.
                    </Text>
                )}
            </>
        </Modal>
    );
};

export default Reservoir;
