import { Switch, Text, Paper, Flex, Group, Box } from '@mantine/core';
import {
    capacityFill,
    storageFill,
} from '@/features/Reservior/TeacupDiagram/consts';
import {
    handleAverageLineEnter,
    handleAverageLineLeave,
    handleCapacityEnter,
    handleCapacityLeave,
    handleStorageEnter,
    handleStorageLeave,
} from '@/features/Reservior/TeacupDiagram/listeners';
import styles from '@/features/Reservior/Reservoir.module.css';

type Props = {
    showLabels: boolean;
    onChange: (showLabels: boolean) => void;
};

export const Legend: React.FC<Props> = (props) => {
    const { showLabels, onChange } = props;

    const handleShowLabels = (showLabels: boolean) => {
        if (showLabels) {
            handleStorageEnter();
            handleCapacityEnter();
            handleAverageLineEnter();
        } else {
            handleStorageLeave(false);
            handleCapacityLeave(false);
            handleAverageLineLeave(false);
        }

        onChange(showLabels);
    };

    return (
        <Flex
            className={styles.legendWrapper}
            p="var(--default-spacing)"
            gap="calc(var(--default-spacing) * 2)"
        >
            <Switch
                label="Show Volumes"
                checked={showLabels}
                onClick={() => handleShowLabels(!showLabels)}
            />
            <Paper bg="#fff">
                <Flex
                    className={styles.legend}
                    p="var(--default-spacing)"
                    gap="var(--default-spacing)"
                    data-testid="graphic-legend"
                >
                    <Group
                        gap={5}
                        onMouseEnter={handleCapacityEnter}
                        onMouseLeave={() => handleCapacityLeave(showLabels)}
                    >
                        <Box
                            style={{
                                backgroundColor: capacityFill,
                            }}
                            className={styles.graphicLegendColor}
                        ></Box>
                        <Text
                            size="sm"
                            c="#000"
                            fw={700}
                            className={styles.graphicLegendText}
                        >
                            Capacity
                        </Text>
                    </Group>
                    <Group
                        gap={5}
                        onMouseEnter={handleStorageEnter}
                        onMouseLeave={() => handleStorageLeave(showLabels)}
                    >
                        <Box
                            style={{ backgroundColor: storageFill }}
                            className={styles.graphicLegendColor}
                        ></Box>
                        <Text
                            size="sm"
                            c="#000"
                            fw={700}
                            className={styles.graphicLegendText}
                        >
                            Storage
                        </Text>
                    </Group>
                </Flex>
            </Paper>
        </Flex>
    );
};
