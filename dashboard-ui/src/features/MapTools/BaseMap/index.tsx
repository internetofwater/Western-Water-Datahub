/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { basemaps } from '@/components/Map/consts';
import { BasemapId } from '@/components/Map/types';
import useMainStore from '@/stores/main';
import {
    CloseButton,
    Grid,
    GridCol,
    Group,
    Image,
    Text,
    Paper,
    Title,
    ActionIcon,
    Popover,
    PopoverDropdown,
    PopoverTarget,
    Tooltip,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { useEffect, useRef, useState } from 'react';
import Basemap from '@/icons/Basemap';
import useSessionStore from '@/stores/session';
import { Overlay } from '@/stores/session/types';

/**
 *
 * @component
 */
export const Selector: React.FC = () => {
    const basemap = useMainStore((state) => state.basemap);
    const setBasemap = useMainStore((state) => state.setBasemap);

    const overlay = useSessionStore((state) => state.overlay);
    const setOverlay = useSessionStore((state) => state.setOverlay);

    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const [show, setShow] = useState(false);

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

    useEffect(() => {
        if (overlay !== Overlay.Basemap) {
            setShow(false);
        }
    }, [overlay]);

    const handleShow = (show: boolean) => {
        setOverlay(show ? Overlay.Basemap : null);
        setShow(show);
    };

    return (
        <Popover
            opened={show}
            onChange={setShow}
            closeOnClickOutside={false}
            position="left-start"
            shadow="md"
        >
            <PopoverTarget>
                <Tooltip label="Show basemap selector" disabled={show}>
                    <ActionIcon
                        classNames={{
                            root: styles.actionIconRoot,
                            icon: styles.actionIcon,
                        }}
                        onClick={() => handleShow(!show)}
                    >
                        <Basemap />
                    </ActionIcon>
                </Tooltip>
            </PopoverTarget>
            <PopoverDropdown>
                <Group
                    justify="space-between"
                    mb="calc(var(--default-spacing) / 2)"
                >
                    <Title order={3} className={styles.mapToolTitle}>
                        Basemaps
                    </Title>
                    <CloseButton
                        mr="-0.5rem"
                        onClick={() => setOverlay(null)}
                        aria-label="Close basemap selector"
                    />
                </Group>
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
                                            c="black"
                                        >
                                            {basemapId.replace(/-/g, ' ')}
                                        </Text>
                                    </Paper>
                                </GridCol>
                            );
                        })}
                </Grid>
            </PopoverDropdown>
        </Popover>
    );
};
