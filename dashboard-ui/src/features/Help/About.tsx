/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import { HELP_LOCAL_KEY } from '@/features/Help';

type Props = {
    showHelp: boolean;
    onClose: () => void;
};

export const About: React.FC<Props> = (props) => {
    const { showHelp, onClose } = props;

    const [showHelpAgain, setShowHelpAgain] = useState(showHelp);

    const handleDontShowClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { checked } = event.currentTarget;
        if (checked) {
            localStorage.setItem(HELP_LOCAL_KEY, 'false');
            setShowHelpAgain(false);
        } else {
            localStorage.setItem(HELP_LOCAL_KEY, 'true');
            setShowHelpAgain(true);
        }
    };

    const paragraph = {
        size: 'md',
    };

    return (
        <Stack mt="calc(var(--default-spacing) * 2)" justify="space-between">
            <Stack
                px="var(--default-spacing)"
                mb="calc(var(--default-spacing) * 2)"
                gap="calc(var(--default-spacing) * 2"
            >
                <Text {...paragraph}>
                    The Western Water Data Dashboard displays reservoir storage
                    conditions and other water-related information to support
                    understanding and management of water resources in the
                    western United States. The dashboard focuses on reservoirs
                    of interest to the Bureau of Reclamation.
                </Text>
                <Text {...paragraph}>
                    The dashboard includes an interactive map with teacup
                    diagrams of reservoir storage data and a variety of
                    reference datasets, including data on drought,
                    precipitation, temperature, and snow water equivalent.
                </Text>
                <Text {...paragraph}>
                    The dashboard also provides detailed teacup diagrams and
                    historical reservoir storage timeseries plots for individual
                    reservoirs.
                </Text>
                <Text {...paragraph}>
                    You can use the dashboard to create customized reports
                    showing the reservoirs in selected regions, basins, or for
                    specific reservoirs of interest, and you can download the
                    images to include in presentations or other communications.
                </Text>
            </Stack>
            <Group justify="space-between">
                <Button size="sm" onClick={onClose}>
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
