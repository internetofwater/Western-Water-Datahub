/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { TEntry } from '@/features/MapTools/Legend/types';
import Line from '@/icons/Line';
import { Gradient } from '@/features/MapTools/Legend/Gradient';
import styles from '@/features/MapTools/Legend/Legend.module.css';
import { getLayerName } from '@/features/Map/config';
import { MainState } from '@/stores/main';
import {
    Box,
    Divider,
    Group,
    Stack,
    Title,
    TitleProps,
    Tooltip,
} from '@mantine/core';
import {
    getTooltipContent,
    isGradientEntry,
    isGroupsEntry,
    isItemsEntry,
} from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Teacups } from '@/features/MapTools/Legend/Teacups';
import { LayerId } from '@/features/Map/consts';
import { Items } from '@/features/MapTools/Legend/Items';
import { Groups } from '@/features/MapTools/Legend/Groups';
import { BoundingGeographyLevel } from '@/stores/main/types';
import { getBoundingGeographyLabel } from '@/utils/getBoundingGeographyLabel';

type Props = {
    entries: TEntry[];
    toggleableLayers: MainState['toggleableLayers'];
    boundingGeographyLevel: BoundingGeographyLevel;
};

export const Content: React.FC<Props> = (props) => {
    const { entries, toggleableLayers, boundingGeographyLevel } = props;

    const titleProps: TitleProps = {
        order: 4,
        size: 'h6',
        maw: '85%',
    };

    return (
        <Stack
            className={styles.wrapper}
            gap="calc(var(--default-spacing) * 2)"
        >
            <Teacups />
            <Divider />
            {entries
                .filter((entry) => Boolean(toggleableLayers[entry.id]))
                .map((entry) => (
                    <li
                        className={styles.listItem}
                        key={`legend-entry-${entry.id}`}
                    >
                        <Tooltip
                            label={getTooltipContent(entry.id)}
                            disabled={!getTooltipContent(entry.id)}
                            position="top-start"
                            multiline
                        >
                            <Title order={4} size="h6">
                                {getLayerName(entry.id)}
                                <Box
                                    component="span"
                                    ml="calc(var(--default-spacing) / 2)"
                                    style={{
                                        display: getTooltipContent(entry.id)
                                            ? 'inline-block'
                                            : 'none',
                                    }}
                                    className={styles.listItemIconWrapper}
                                >
                                    <Info />
                                </Box>
                            </Title>
                        </Tooltip>
                        {isItemsEntry(entry) && (
                            <Items id={entry.id} entry={entry} />
                        )}
                        {isGradientEntry(entry) && (
                            <Gradient
                                colors={entry.colors}
                                from={entry?.from ?? ''}
                                to={entry?.to ?? ''}
                            />
                        )}
                        {isGroupsEntry(entry) && <Groups entry={entry} />}
                    </li>
                ))}
            {boundingGeographyLevel !== BoundingGeographyLevel.None && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#000" />
                    </Box>
                    <Title {...titleProps}>
                        {getBoundingGeographyLabel(boundingGeographyLevel)}{' '}
                        Filter Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.RegionsReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#ef5e25" />
                    </Box>
                    <Title {...titleProps}>
                        {getBoundingGeographyLabel(
                            BoundingGeographyLevel.Region
                        )}{' '}
                        Reference Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.ManagingRegionsReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#A10039" />
                    </Box>
                    <Title {...titleProps}>
                        {getBoundingGeographyLabel(
                            BoundingGeographyLevel.ManagingRegion
                        )}{' '}
                        Reference Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.BasinsReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#54278f" />
                    </Box>
                    <Title {...titleProps}>
                        {getBoundingGeographyLabel(
                            BoundingGeographyLevel.Basin
                        )}{' '}
                        Reference Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.StatesReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#34a37e" />
                    </Box>
                    <Title {...titleProps}>
                        {getBoundingGeographyLabel(
                            BoundingGeographyLevel.State
                        )}{' '}
                        Reference Boundaries
                    </Title>
                </Group>
            )}
        </Stack>
    );
};
