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
import { Box, Group, Loader, Radio, Space, Title } from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Chart as ChartJS, ChartData } from 'chart.js';
import useMainStore from '@/stores/main/main';
import { ReservoirConfig } from '@/features/Map/types';

type Props = {
    id: string | number;
    ref: RefObject<ChartJS<'line', Array<{ x: string; y: number }>> | null>;
    config: ReservoirConfig;
};

/**

 * @component
 */
export const Chart: React.FC<Props> = (props) => {
    const { ref, id, config } = props;

    const [data, setData] = useState<Array<{ x: string; y: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<DateRange>(1);
    const [error, setError] = useState('');

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

    const getReservoirStorage = async (range: DateRange) => {
        try {
            if (isMounted.current) {
                setLoading(true);
            }
            controller.current = new AbortController();

            const dateRange = getDateRange(range);

            const coverageCollection =
                await wwdhService.getLocation<CoverageCollection>(
                    config.id,
                    String(id),
                    {
                        signal: controller.current.signal,
                        params: {
                            limit: dateRange.days,
                            f: 'json',
                            ...config.params,
                            datetime: dateRange.startDate + '/' + '..',
                        },
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
                if ((error as Error)?.message) {
                    if (isMounted.current) {
                        const _error = error as Error;
                        setError(_error.message);
                        setLoading(false);
                    }
                }
            }
        }
    };

    useEffect(() => {
        setError('');
        chartDidUpdate.current = false;
        void getReservoirStorage(range);
    }, [range, id]);

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
        <>
            <Group justify="space-between">
                <Title order={3} size="h5">
                    Storage Volume (acre-feet)
                </Title>
                <Group>
                    <Radio
                        label="1 year"
                        data-testid="1-year-radio"
                        checked={range === 1}
                        onChange={() => setRange(1)}
                    />
                    <Radio
                        label="5 years"
                        data-testid="5-year-radio"
                        checked={range === 5}
                        onChange={() => setRange(5)}
                    />
                    <Radio
                        label="10 years"
                        data-testid="10-year-radio"
                        checked={range === 10}
                        onChange={() => setRange(10)}
                    />
                    <Radio
                        label="30 years"
                        data-testid="30-year-radio"
                        checked={range === 30}
                        onChange={() => setRange(30)}
                    />
                </Group>
            </Group>
            <Space h="sm" />
            <Box className={styles.chartContainer}>
                {loading ? (
                    <Loader data-testid="chart-loader-bar" />
                ) : error.length > 0 ? (
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
        </>
    );
};
