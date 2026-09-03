/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box, Divider, Stack, Title } from '@mantine/core';
import Image from 'next/image';
import styles from '@/features/Panel/Panel.module.css';

export const Header: React.FC = () => {
    return (
        <Stack
            id="header"
            component="header"
            gap="calc(var(--default-spacing) / 2)"
            align="center"
            pt="calc(var(--default-spacing) * 2)"
            pb="calc(var(--default-spacing) * 2)"
        >
            <Box component="span" darkHidden className={styles.logoContainer}>
                <Image
                    src={'/BofR-logo-dark.png'}
                    alt="United States Bureau of Reclamation Logo"
                    width={157}
                    height={50}
                />
            </Box>
            <Box component="span" lightHidden className={styles.logoContainer}>
                <Image
                    src={'/BofR-logo-white.png'}
                    alt="United States Bureau of Reclamation Logo"
                    width={157}
                    height={50}
                />
            </Box>
            <Divider />
            <Title order={1} size="h2" ta="center">
                Western Water Data Dashboard
            </Title>
        </Stack>
    );
};
