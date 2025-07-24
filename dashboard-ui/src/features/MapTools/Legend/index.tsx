/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import useMainStore from '@/lib/main';
import { Card, CardSection, CloseButton, Group, Title } from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import Legend from '@/features/Legend';
import { Tools } from '@/lib/types';

/**
 *
 * @component
 */
const LegendTool: React.FC = () => {
    const toggleableLayers = useMainStore((state) => state.toggleableLayers);
    const setOpenTools = useMainStore((state) => state.setOpenTools);

    return (
        <Card withBorder shadow="sm" radius="md" padding="md">
            <CardSection withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Title order={3} className={styles.mapToolTitle}>
                        Legend
                    </Title>
                    <CloseButton
                        onClick={() => setOpenTools(Tools.Legend, false)}
                        aria-label="Close Legend"
                    />
                </Group>
            </CardSection>
            <CardSection inheritPadding py="md" className={styles.toolContent}>
                <Legend toggleableLayers={toggleableLayers} />
            </CardSection>
        </Card>
    );
};

export default LegendTool;
