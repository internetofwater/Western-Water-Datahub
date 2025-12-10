/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Box, Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { INFO_LOCAL_KEY } from '@/features/Help';
import useSessionStore from '@/stores/session';

type Props = {
    showHelp: boolean;
};

export const About: React.FC<Props> = (props) => {
    const { showHelp } = props;

    const setOverlay = useSessionStore((state) => state.setOverlay);

    const [showHelpAgain, setShowHelpAgain] = useState(showHelp);

    const handleDontShowClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { checked } = event.currentTarget;
        if (checked) {
            localStorage.setItem(INFO_LOCAL_KEY, 'false');
            setShowHelpAgain(false);
        } else {
            localStorage.setItem(INFO_LOCAL_KEY, 'true');
            setShowHelpAgain(true);
        }
    };

    const paragraph = {
        size: 'md',
    };

    return (
        <Stack mt="calc(var(--default-spacing) * 2)">
            <Box
                px="var(--default-spacing)"
                mb="calc(var(--default-spacing) * 2)"
            >
                <Text {...paragraph}>
                    The Western Water Data Dashboard provides fast access to
                    current reservoir data and supplemental information.
                    Allowing you to view droughts, precipitation, snow water
                    equivalents and more!
                </Text>
            </Box>
            <Group justify="space-between">
                <Button size="sm" onClick={() => setOverlay(null)}>
                    Continue
                </Button>
                <Checkbox
                    size="sm"
                    checked={!showHelpAgain}
                    onChange={(event) => handleDontShowClick(event)}
                    label="Don't show again"
                />
            </Group>
        </Stack>
    );
};
