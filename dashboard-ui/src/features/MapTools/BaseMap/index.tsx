/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import useMainStore from '@/stores/main/main';
import {
    Card,
    CardSection,
    CloseButton,
    Grid,
    GridCol,
    Group,
    Image,
    Text,
    Paper,
    Title,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { Tools } from '@/stores/main/types';
import { useEffect, useRef, useState } from 'react';

/**
 *
 * @component
 */
export const Selector: React.FC = () => {
    const basemap = useMainStore((state) => state.basemap);
    const setBasemap = useMainStore((state) => state.setBasemap);
    const setOpenTools = useMainStore((state) => state.setOpenTools);

    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const [isLocked, setIsLocked] = useState(false);

    const handleClick = (basemapId: BasemapId) => {
        setBasemap(basemapId);
        setIsLocked(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setIsLocked(false);
        }, 3500);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

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
                <Grid className={styles.basemapWrapper} gutter="sm">
                    {Object.keys(basemaps)
                        .filter((key) =>
                            [
                                BasemapId.Streets,
                                BasemapId.SatelliteStreets,
                                BasemapId.Light,
                                BasemapId.Dark,
                            ].includes(key as BasemapId)
                        )
                        .map((key) => {
                            const basemapId = key as BasemapId;
                            const isSelected = basemap === basemapId;

                            return (
                                <GridCol span={6} key={basemapId}>
                                    <Paper
                                        role="radio"
                                        id={basemapId}
                                        withBorder
                                        className={styles.basemapSelector}
                                        radius={0}
                                        tabIndex={0}
                                        data-disabled={isLocked}
                                        onClick={() =>
                                            !isLocked && handleClick(basemapId)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                !isLocked &&
                                                (e.key === 'Enter' ||
                                                    e.key === ' ')
                                            ) {
                                                handleClick(basemapId);
                                            }
                                        }}
                                        style={{
                                            borderColor: isSelected
                                                ? '#4B5563'
                                                : '#D1D5DB',
                                            backgroundColor: isSelected
                                                ? '#F3F4F6'
                                                : '#FFFFFF',
                                        }}
                                    >
                                        <Image
                                            src={`/basemaps/${basemapId}.png`}
                                            alt={`Image for ${basemapId.replace(
                                                /-/g,
                                                ' '
                                            )}`}
                                            width="auto"
                                            height={55}
                                            fit="contain"
                                            radius="sm"
                                        />
                                        <Text
                                            component="label"
                                            htmlFor={basemapId}
                                            mt="xs"
                                            mb={0}
                                            size="sm"
                                            className={styles.capitalize}
                                        >
                                            {basemapId.replace(/-/g, ' ')}
                                        </Text>
                                    </Paper>
                                </GridCol>
                            );
                        })}
                </Grid>
            </CardSection>
        </Card>
    );
};
