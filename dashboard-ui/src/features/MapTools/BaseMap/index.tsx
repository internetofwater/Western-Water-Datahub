/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import useMainStore from '@/lib/main';
import {
    Box,
    Card,
    CardSection,
    Checkbox,
    CloseButton,
    Group,
    Stack,
    Title,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { Tools } from '@/lib/types';

/**
 *
 * @component
 */
export const Selector: React.FC = () => {
    const basemap = useMainStore((state) => state.basemap);
    const setBasemap = useMainStore((state) => state.setBasemap);
    const setOpenTools = useMainStore((state) => state.setOpenTools);

    return (
        <Card
            withBorder
            shadow="sm"
            radius="md"
            padding="md"
            className={styles.basemapSelectorContainer}
        >
            <CardSection withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Title order={3} className={styles.mapToolTitle}>
                        Basemaps
                    </Title>
                    <CloseButton
                        onClick={() =>
                            setOpenTools(Tools.BasemapSelector, false)
                        }
                        aria-label="Close Basemaps"
                    />
                </Group>
            </CardSection>
            <CardSection inheritPadding py="md" className={styles.toolContent}>
                <Stack>
                    {Object.keys(basemaps).map((key) => {
                        const basemapId = key as BasemapId;

                        return (
                            <Checkbox
                                key={basemapId}
                                label={
                                    <Box
                                        component="span"
                                        className={
                                            styles.basemapSelectorCheckboxLabel
                                        }
                                    >
                                        {basemapId.replace(/-/g, ' ')}
                                    </Box>
                                }
                                checked={basemapId === basemap}
                                onChange={() => setBasemap(basemapId)}
                            />
                        );
                    })}
                </Stack>
            </CardSection>
        </Card>
    );
};
