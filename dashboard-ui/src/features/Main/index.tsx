/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Box, Group, Stack, Notification, Text } from '@mantine/core';
import Map from '@/features/Map';
import styles from '@/features/Main/Main.module.css';
import { MapTools } from '@/features/MapTools';
import Panel from '@/features/Panel';
import Popups from '@/features/Popups';
import Reservoir from '@/features/Reservior';
import Loading from '../Loading';
import { useState } from 'react';
import { MobilePanelButton } from '../MapTools/MobilePanelButton';

type Props = {
    accessToken: string;
};

/**

 * @component
 */
const Main: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const [showNotification, setShowNotification] = useState(true);

    const handleClick = () => {
        setShowNotification(!showNotification);
    };

    return (
        <>
            <Group gap={0} align="flex-start" className={styles.primaryWrapper}>
                <Panel accessToken={accessToken} />
                <Stack gap={0} className={styles.right}>
                    <Map accessToken={accessToken} />
                    <Box
                        className={`${styles.container} ${styles.left} ${styles.top}`}
                    >
                        <Stack gap={'var(--default-spacing)'}>
                            <MobilePanelButton />
                            {showNotification && (
                                <Notification
                                    className={styles.notification}
                                    classNames={{
                                        description: styles.betaDescription,
                                    }}
                                    title={
                                        <Text fw={700}>Application Beta</Text>
                                    }
                                    withCloseButton
                                    onClick={handleClick}
                                >
                                    <Text size="sm">
                                        This application is still in active
                                        development. Some features may not be
                                        fully implemented.
                                    </Text>
                                </Notification>
                            )}
                        </Stack>
                    </Box>
                    <Box
                        className={`${styles.container} ${styles.left} ${styles.bottom}`}
                    >
                        <Popups />
                    </Box>

                    <Loading desktop />
                </Stack>
            </Group>
            <Reservoir />
            <MapTools />
        </>
    );
};

export default Main;
