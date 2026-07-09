/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LineChart } from '@/components/LineChart';
import wwdhService from '@/services/init/wwdh.init';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import {
    DateRange,
    getDateRange,
    getLabelsAndValues,
} from '@/features/Reservior/Chart/utils';
import { CoverageCollection } from '@/services/edr.service';
import {
    Anchor,
    Box,
    Group,
    Radio,
    Skeleton,
    Space,
    Stack,
    Title,
} from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Chart as ChartJS, ChartData } from 'chart.js';
import useMainStore from '@/stores/main';
import { ReservoirConfigProperties } from '@/features/Map/types';
import { buildLocationUrl } from '@/utils/edrUrl';

type Props = {
    id: string | number;
    ref: RefObject<ChartJS<'line', Array<{ x: string; y: number }>> | null>;
    config: ReservoirConfigProperties;
    currentDate: string | null;
    source: string;
    isDataValid: boolean;
};

/**

 * @component
 */
export const Chart: React.FC<Props> = (props) => {
    const { ref, id, config, currentDate, source, isDataValid } = props;

    const [data, setData] = useState<Array<{ x: string; y: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<DateRange>(1);
    const [error, setError] = useState('');
    const [locationUrl, setLocationUrl] = useState<string>();

    const setChartUpdate = useMainStore((state) => state.setChartUpdate);

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);
    const chartDidUpdate = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
            // Remove chart instance on unmount
            if (ref.current) {
                ref.current.destroy();
            }
        };
    }, []);

    const getReservoirStorage = async (
        reservoirDate: string | null,
        range: DateRange
    ) => {
        const stringId = String(id);
        const dateRange = getDateRange(reservoirDate, range);
        const params = {
            'parameter-name': 'raw',
            limit: dateRange.days,
            ...config.params,
            datetime: dateRange.startDate + '/' + dateRange.endDate,
        };
        const locationUrl = buildLocationUrl(
            source,
            stringId,
            params,
            null,
            null,
            false,
            true
        );

        setLocationUrl(locationUrl);
        try {
            if (isMounted.current) {
                setLoading(true);
            }
            controller.current = new AbortController();

            const coverageCollection =
                await wwdhService.getLocation<CoverageCollection>(
                    source,
                    String(id),
                    {
                        signal: controller.current.signal,
                        params,
                    }
                );

            const data = getLabelsAndValues(
                coverageCollection,
                config.chartLabel
            );

            if (isMounted.current) {
                setData(data);
                setLoading(false);
            }
        } catch (error) {
            if (
                (error as Error)?.name === 'AbortError' ||
                (typeof error === 'string' && error === 'Component unmount')
            ) {
                console.log('Fetch request canceled');
            } else {
                if (isMounted.current) {
                    setError('No data found.');
                    setLoading(false);
                }

                if ((error as Error)?.message) {
                    if (isMounted.current) {
                        const _error = error as Error;
                        setError(_error.message);
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (isDataValid) {
            setError('');
        } else {
            setError('No Storage Measurement on this date');
        }
    }, [isDataValid]);

    useEffect(() => {
        setError('');
        chartDidUpdate.current = false;
        void getReservoirStorage(currentDate, range);
    }, [currentDate, range, id]);

    const chartData: ChartData<'line', Array<{ x: string; y: number }>> = {
        datasets: [
            {
                label: 'Storage Volume (acre-feet)',
                data,
                borderColor: 'rgb(0, 119, 154)',
                backgroundColor: 'rgba(0, 119, 154, 0.5)',
                borderWidth: 1,
                fill: true,
            },
        ],
    };

    return (
        <Stack gap="var(--default-spacing)">
            <Group justify="space-between">
                <Group gap="var(--default-spacing)" align="center">
                    <Title order={3} size="h5">
                        Storage Volume (acre-feet)
                    </Title>
                    {locationUrl && (
                        <Anchor
                            target="_blank"
                            href={locationUrl}
                            title="The data used to populate this chart."
                            size="lg"
                            mb="-0.25rem"
                            c="#0098c7"
                        >
                            Data
                        </Anchor>
                    )}
                </Group>
                <Radio.Group
                    value={String(range)}
                    onChange={(range) => setRange(Number(range) as DateRange)}
                >
                    <Group gap="var(--default-spacing)">
                        <Radio
                            label="Past year"
                            data-testid="1-year-radio"
                            value={'1'}
                            disabled={loading}
                        />
                        <Radio
                            label="Past 5 years"
                            data-testid="5-year-radio"
                            value={'5'}
                            disabled={loading}
                        />
                        <Radio
                            label="Past 10 years"
                            data-testid="10-year-radio"
                            value={'10'}
                            disabled={loading}
                        />
                        <Radio
                            label="Past 30 years"
                            data-testid="30-year-radio"
                            value="30"
                            disabled={loading}
                        />
                    </Group>
                </Radio.Group>
            </Group>
            <Space h="sm" />
            <Skeleton visible={loading}>
                <Box className={styles.chartContainer}>
                    {error.length > 0 ? (
                        <>{error}</>
                    ) : (
                        <LineChart
                            ref={ref}
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        type: 'time',

                                        time: {
                                            minUnit: 'month', // smallest time format
                                            displayFormats: {
                                                month: 'MMM yyyy',
                                            },
                                            tooltipFormat: 'MMM D, yyyy',
                                        },
                                    },
                                },
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                animation: {
                                    onComplete: function () {
                                        if (!chartDidUpdate.current) {
                                            chartDidUpdate.current = true;
                                            setChartUpdate(Date.now());
                                        }
                                    },
                                },
                            }}
                        />
                    )}
                </Box>
            </Skeleton>
        </Stack>
    );
};
