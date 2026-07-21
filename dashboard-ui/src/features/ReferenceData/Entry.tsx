/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Stack, Switch, Tooltip, Text } from '@mantine/core';
import { getTooltipContent } from '@/features/MapTools/Legend/utils';
import Info from '@/icons/Info';
import { Links, TManualLinks } from '@/features/ReferenceData/Links';
import styles from '@/features/ReferenceData/ReferenceData.module.css';
import { MainState } from '@/stores/main';

type Props = {
    layerId: keyof MainState['toggleableLayers'];
    label: string;
    onClick: (
        layerId: keyof MainState['toggleableLayers'],
        visible: boolean
    ) => void;
    toggleableLayers: MainState['toggleableLayers'];
    links?: boolean | TManualLinks;
    disabled?: boolean;
};
export const Entry: React.FC<Props> = (props) => {
    const {
        layerId,
        label,
        onClick,
        toggleableLayers,
        links = true,
        disabled = false,
    } = props;

    const tooltipContent = getTooltipContent(layerId);
    const hasTooltip = Boolean(tooltipContent);

    const isLinksObject = typeof links === 'object';
    const manualLinks = isLinksObject ? links : undefined;
    const includeLinks = isLinksObject ? Object.keys(links).length > 0 : links;

    return (
        <Stack gap="calc(var(--default-spacing) / 2)">
            <Switch
                label={
                    <Tooltip
                        label={tooltipContent}
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
                onClick={() => onClick(layerId, !toggleableLayers[layerId])}
                disabled={disabled}
            />
            {includeLinks && (
                // Inset links to align with label
                <Box ml="calc(var(--default-spacing) * 6)">
                    <Links collectionId={layerId} manualLinks={manualLinks} />
                </Box>
            )}
        </Stack>
    );
};
