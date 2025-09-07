import DashedLine from '@/icons/DashedLine';
import Square from '@/icons/Square';
import { Stack, Text, Image, Group } from '@mantine/core';
import { capacityFill, storageFill } from '../Reservior/TeacupDiagram/consts';
import styles from '@/features/Legend/Legend.module.css';

export const Teacups: React.FC = () => {
    return (
        <Stack>
            <Text size="xl" fw={700}>
                Reservoirs
            </Text>
            <Group>
                <Image
                    src="/map-icons/teacup-65-50.png"
                    alt="Reservoir Teacup Icon"
                    h={75}
                    w="auto"
                    fit="contain"
                />
                <Stack>
                    <Group gap="xs" className={styles.teacupLegend}>
                        <Square fill={capacityFill} width={20} height={20} />
                        <Text>Capacity</Text>
                    </Group>
                    <Group gap="xs" className={styles.teacupLegend}>
                        <Square fill={storageFill} width={20} height={20} />
                        <Text>Storage</Text>
                    </Group>
                    <Group gap="xs" className={styles.thirtyYearAverageLegend}>
                        <DashedLine />
                        <Text>30 year Average</Text>
                    </Group>
                </Stack>
            </Group>
        </Stack>
    );
};
