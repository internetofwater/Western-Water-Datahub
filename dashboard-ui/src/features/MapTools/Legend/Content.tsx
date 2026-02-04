/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Entry } from '@/features/MapTools/Legend/types';
import { LayerType } from '@/components/Map/types';
import Line from '@/icons/Line';
import Circle from '@/icons/Circle';
import Square from '@/icons/Square';
import { Gradient } from '@/features/MapTools/Legend/Gradient';
import styles from '@/features/MapTools/Legend/Legend.module.css';
import { getLayerName } from '@/features/Map/config';
import { MainState } from '@/stores/main';
import {
    Box,
    Divider,
    Group,
    Stack,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Teacups } from '@/features/MapTools/Legend/Teacups';
import { LayerId } from '@/features/Map/consts';

type Props = {
    entries: Entry[];
    toggleableLayers: MainState['toggleableLayers'];
};

export const Content: React.FC<Props> = (props) => {
    const { entries, toggleableLayers } = props;

    return (
        <Stack className={styles.wrapper}>
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
                        >
                            <Group align="center" gap="xs">
                                <Title order={4} size="h6">
                                    {getLayerName(entry.id)}
                                </Title>
                                <Box
                                    component="span"
                                    style={{
                                        display:
                                            getTooltipContent(entry.id).length >
                                            0
                                                ? 'inline-block'
                                                : 'none',
                                    }}
                                    className={styles.listItemIconWrapper}
                                >
                                    <Info />
                                </Box>
                            </Group>
                        </Tooltip>
                        {[
                            LayerType.Line,
                            LayerType.Circle,
                            LayerType.Fill,
                        ].includes(entry.type) ? (
                            <ul className={styles.list}>
                                {entry.type === LayerType.Line &&
                                    entry?.items &&
                                    entry.items.map((item) => (
                                        <li
                                            className={styles.subListItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Line color={item.color} />
                                                <Text
                                                    size="xs"
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>
                                            </div>
                                        </li>
                                    ))}
                                {entry.type === LayerType.Circle &&
                                    entry?.items &&
                                    entry.items.map((item) => (
                                        <li
                                            className={styles.subListItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Circle color={item.color} />
                                                <Text
                                                    size="xs"
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>
                                            </div>
                                        </li>
                                    ))}
                                {entry.type === LayerType.Fill &&
                                    entry?.items &&
                                    entry.items.map((item) => (
                                        <li
                                            className={styles.subListItem}
                                            key={`legend-item-${entry.id}-${item.label}`}
                                        >
                                            <div
                                                className={
                                                    styles.entryContainer
                                                }
                                            >
                                                <Square
                                                    fill={item.color}
                                                    stroke={item.color}
                                                    height={25}
                                                    width={25}
                                                />
                                                <Text
                                                    size="xs"
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <>
                                {entry.type === LayerType.Raster &&
                                    entry?.colors && (
                                        <Gradient
                                            colors={entry.colors}
                                            from={entry?.from ?? ''}
                                            to={entry?.to ?? ''}
                                        />
                                    )}
                            </>
                        )}
                    </li>
                ))}
            {toggleableLayers[LayerId.RegionsReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#ef5e25" />
                    </Box>
                    <Title order={4} size="h6">
                        DOI Region Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.BasinsReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#54278f" />
                    </Box>
                    <Title order={4} size="h6">
                        Basin (HUC02) Boundaries
                    </Title>
                </Group>
            )}
            {toggleableLayers[LayerId.StatesReference] && (
                <Group gap="calc(var(--default-spacing) / 2)">
                    <Box className={styles.iconBackground}>
                        <Line color="#34a37e" />
                    </Box>
                    <Title order={4} size="h6">
                        State Boundaries
                    </Title>
                </Group>
            )}
        </Stack>
    );
};
