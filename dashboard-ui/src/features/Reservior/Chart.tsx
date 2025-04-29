import { LineChart } from '@/components/LineChart';
import edrService from '@/services/edr.init';
import React, { useEffect, useRef, useState } from 'react';
import { getDateRange, getLabelsAndValues } from './utils';
import { CoverageCollection } from '@/services/edr.service';
import { Box, Group, Loader, Paper, Radio, Space, Title } from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { ChartData } from 'chart.js';

type Props = {
    id: number;
};

/**

 * @component
 */
export const Chart: React.FC<Props> = (props) => {
    const { id } = props;

    const [data, setData] = useState<Array<{ x: string; y: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<1 | 5>(1);
    const [error, setError] = useState('');

    const controller = useRef<AbortController>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort('Component unmount');
            }
        };
    }, []);

    const getReservoirStorage = async (range: 1 | 5) => {
        try {
            if (isMounted.current) {
                setLoading(true);
            }
            controller.current = new AbortController();

            const dateRange = getDateRange(range);

            const coverageCollection =
                await edrService.getLocation<CoverageCollection>(
                    'rise-edr',
                    String(id),
                    {
                        signal: controller.current.signal,
                        params: {
                            'parameter-name': '3',
                            datetime: dateRange.startDate + '/',
                        },
                    }
                );

            const data = getLabelsAndValues(
                coverageCollection,
                'Lake/Reservoir Storage'
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
                    const _error = error as Error;
                    setError(_error.message);
                    setLoading(false);
                }
            }
        }
    };

    useEffect(() => {
        setError('');
        void getReservoirStorage(range);
    }, [id, range]);

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
        <Paper shadow="xs" p="xs" className={styles.infoContainer}>
            <Group justify="space-between">
                <Title order={3} size="h5">
                    Storage Volume (acre-feet)
                </Title>
                <Group>
                    <Radio
                        label="1 year"
                        checked={range === 1}
                        onChange={() => setRange(1)}
                    />
                    <Radio
                        label="5 years"
                        checked={range === 5}
                        onChange={() => setRange(5)}
                    />
                </Group>
            </Group>
            <Space h="sm" />
            <Box className={styles.chartContainer}>
                {loading ? (
                    <Loader />
                ) : error.length > 0 ? (
                    <>{error}</>
                ) : (
                    <LineChart
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
                        }}
                    />
                )}
            </Box>
        </Paper>
    );
};
