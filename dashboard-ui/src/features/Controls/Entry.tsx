/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Group, Stack, Switch, Tooltip, Text } from '@mantine/core';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Links } from './Links';
import styles from '@/features/Controls/Controls.module.css';
import { MainState } from '@/stores/main';

type Props = {
    layerId: keyof MainState['toggleableLayers'];
    label: string;
    onClick: (visible: boolean) => void;
    toggleableLayers: MainState['toggleableLayers'];
};
export const Entry: React.FC<Props> = (props) => {
    const { layerId, label, onClick, toggleableLayers } = props;

    return (
        <Stack gap="calc(var(--default-spacing) / 2)">
            <Switch
                label={
                    <Tooltip
                        label={getTooltipContent(layerId)}
                        disabled={!getTooltipContent(layerId)}
                        position="top-start"
                    >
                        <Group align="center" gap="xs">
                            <Text size="sm">{label}</Text>
                            <Box
                                component="span"
                                style={{
                                    display:
                                        getTooltipContent(layerId).length > 0
                                            ? 'inline-block'
                                            : 'none',
                                }}
                                className={styles.labelIcon}
                            >
                                <Info />
                            </Box>
                        </Group>
                    </Tooltip>
                }
                aria-label={label}
                checked={toggleableLayers[layerId]}
                onClick={() => onClick(!toggleableLayers[layerId])}
            />
            <Links collectionId={layerId} />
        </Stack>
    );
};
