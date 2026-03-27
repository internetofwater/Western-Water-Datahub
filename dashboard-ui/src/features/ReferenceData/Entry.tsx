/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Stack, Switch, Tooltip, Text } from '@mantine/core';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Links } from '@/features/ReferenceData/Links';
import styles from '@/features/ReferenceData/ReferenceData.module.css';
import { MainState } from '@/stores/main';

type Props = {
    layerId: keyof MainState['toggleableLayers'];
    label: string;
    onClick: (visible: boolean) => void;
    toggleableLayers: MainState['toggleableLayers'];
    links?: boolean;
};
export const Entry: React.FC<Props> = (props) => {
    const { layerId, label, onClick, toggleableLayers, links = true } = props;

    const tooltipContent = getTooltipContent(layerId);
    const hasTooltip = Boolean(tooltipContent);

    return (
        <Stack gap="calc(var(--default-spacing) / 2)">
            <Switch
                label={
                    <Tooltip
                        label={getTooltipContent(layerId)}
                        disabled={!hasTooltip}
                        position="top-start"
                        multiline
                    >
                        <Text size="sm">
                            {label}
                            <Box
                                ml="calc(var(--default-spacing) / 2)"
                                component="span"
                                style={{
                                    display: hasTooltip
                                        ? 'inline-block'
                                        : 'none',
                                }}
                                className={styles.labelIcon}
                            >
                                <Info />
                            </Box>
                        </Text>
                    </Tooltip>
                }
                aria-label={label}
                checked={toggleableLayers[layerId]}
                onClick={() => onClick(!toggleableLayers[layerId])}
            />
            {links && <Links collectionId={layerId} />}
        </Stack>
    );
};
