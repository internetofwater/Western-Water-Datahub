import { ReservoirConfig } from '@/features/Map/types';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import useMainStore from '@/stores/main/main';
import { Card, Stack, Title, Text, Group, Box } from '@mantine/core';
import dayjs from 'dayjs';
import { GeoJsonProperties } from 'geojson';
import styles from '@/features/Popups/Popups.module.css';
import { TextBlock } from '@/components/TextBlock';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

export const Hover: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const colorScheme = useMainStore((state) => state.colorScheme);

    if (!reservoirProperties) {
        return null;
    }

    const storage = Number(reservoirProperties[config.storageProperty]);
    const capacity = Number(reservoirProperties[config.capacityProperty]);
    const average = Number(
        reservoirProperties[config.thirtyYearAverageProperty]
    );
    const ninetiethPercentile = Number(
        reservoirProperties[config.ninetiethPercentileProperty]
    );
    const tenthPercentile = Number(
        reservoirProperties[config.tenthPercentileProperty]
    );

    const percentFull = ((storage / capacity) * 100).toFixed(1);
    const percentOfAverage = ((storage / average) * 100).toFixed(1);

    return (
        <Card
            shadow="sm"
            padding="sm"
            radius="md"
            opacity={0.9}
            withBorder
            className={styles.reservoirPopup}
        >
            <Group justify="space-between">
                <Stack gap="xs" className={styles.reservoirLeft}>
                    <Title order={4} size="h5">
                        {reservoirProperties[config.labelProperty]}
                    </Title>
                    <Graphic
                        reservoirProperties={reservoirProperties}
                        config={config}
                        showLabels={false}
                        labels={true}
                        listeners={false}
                        colorScheme={colorScheme}
                    />
                </Stack>
                <Stack gap="xs" className={styles.reservoirRight}>
                    <Box>
                        <Text size="xs">
                            Data as of:{' '}
                            {dayjs(
                                reservoirProperties[
                                    config.storageDateProperty
                                ] as string
                            ).format('MM/DD/YYYY')}
                        </Text>
                        <TextBlock w="100%">
                            <Group gap={4} justify="flex-start">
                                <Text size="xs" fw={700}>
                                    Capacity:
                                </Text>
                                <Text size="xs">
                                    {capacity.toLocaleString('en-US')}
                                    &nbsp;acre-feet
                                </Text>
                            </Group>
                            <Group gap={4} justify="flex-start">
                                <Text size="xs" fw={700}>
                                    Storage:
                                </Text>
                                <Text size="xs">
                                    {storage.toLocaleString('en-US')}
                                    &nbsp;acre-feet
                                </Text>
                            </Group>
                            <Group gap={4} justify="flex-start">
                                <Text size="xs" fw={700}>
                                    (High) 90<sup>th</sup> Percentile:
                                </Text>
                                <Text size="xs">
                                    {ninetiethPercentile.toLocaleString(
                                        'en-US'
                                    )}
                                    &nbsp;acre-feet
                                </Text>
                            </Group>
                            <Group gap={4} justify="flex-start">
                                <Text size="xs" fw={700}>
                                    (Low) 10<sup>th</sup> Percentile:
                                </Text>
                                <Text size="xs">
                                    {tenthPercentile.toLocaleString('en-US')}
                                    &nbsp;acre-feet
                                </Text>
                            </Group>
                        </TextBlock>
                    </Box>
                    <TextBlock w="100%">
                        <Group gap={4} justify="flex-start">
                            <Text size="xs" fw={700}>
                                Percent Full:
                            </Text>
                            <Text size="xs">{percentFull}%</Text>
                        </Group>
                        <Group gap={4} justify="flex-start">
                            <Text size="xs" fw={700}>
                                Percent of Average:
                            </Text>
                            <Text size="xs">{percentOfAverage}%</Text>
                        </Group>
                    </TextBlock>
                </Stack>
            </Group>
            <Text size="xs" ta="center">
                Click to Learn More
            </Text>
        </Card>
    );
};
