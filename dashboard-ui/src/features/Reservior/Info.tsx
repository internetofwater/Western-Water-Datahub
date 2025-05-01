import { Paper, Stack, Title, Text, Group } from '@mantine/core';
import PDF from '@/features/Reservior/PDF';
import { ReservoirProperties } from '../Map/types';
import { Chart as ChartJS } from 'chart.js';
import { RefObject } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';

type Props = {
    accessToken: string;
    reservoirProperties: ReservoirProperties;
    center: [number, number] | null;
    chartRef: RefObject<ChartJS<
        'line',
        Array<{ x: string; y: number }>
    > | null>;
};

/**
 *
 * @component
 */
export const Info: React.FC<Props> = (props) => {
    const { accessToken, reservoirProperties, center, chartRef } = props;

    return (
        <Paper shadow="xs" p="xs" className={styles.infoContainer}>
            <Stack justify="space-between" align="flex-start">
                <Title order={2} size={'h3'}>
                    {reservoirProperties.locationName}
                </Title>
                <Stack gap="xs">
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Active Capacity:</Text>
                        <Text>
                            {reservoirProperties[
                                'Active Capacity'
                            ].toLocaleString('en-US')}{' '}
                            acre-feet
                        </Text>
                    </Group>
                    <Group gap="xs" justify="flex-start">
                        <Text fw={700}>Region:</Text>
                        <Text>
                            {reservoirProperties.locationUnifiedRegionNames[0]}
                        </Text>
                    </Group>
                </Stack>
                <PDF
                    reservoirProperties={reservoirProperties}
                    accessToken={accessToken}
                    center={center}
                    chartRef={chartRef}
                />
            </Stack>
        </Paper>
    );
};
