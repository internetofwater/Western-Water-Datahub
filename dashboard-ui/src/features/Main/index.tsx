/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Box, Group, Stack, Notification, Text, Anchor } from '@mantine/core';
import Map from '@/features/Map';
import styles from '@/features/Main/Main.module.css';
import { MapTools } from '@/features/MapTools';
import Panel from '@/features/Panel';
import Popups from '@/features/Popups';
import Reservoir from '@/features/Reservior';
import Loading from '@/features/Loading';
import { MobilePanelButton } from '@/features/MapTools/MobilePanelButton';
import { DATA_USBR_MAILTO } from '@/features/Help/consts';
import { useState } from 'react';

type Props = {
    accessToken: string;
};

/**

 * @component
 */
const Main: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const [showNotification, setShowNotification] = useState(true);

    const handleClick = () => setShowNotification(false);

    return (
        <>
            <Group gap={0} align="flex-start" className={styles.primaryWrapper}>
                <Panel accessToken={accessToken} />
                <Stack gap={0} className={styles.right}>
                    <Map accessToken={accessToken} />
                    <Box
                        className={`${styles.container} ${styles.left} ${styles.top}`}
                    >
                        <Stack
                            gap={'var(--default-spacing)'}
                            align="flex-start"
                        >
                            <MobilePanelButton />
                            {showNotification && (
                                <Notification
                                    className={styles.notification}
                                    classNames={{
                                        description: styles.description,
                                        closeButton: styles.closeButton,
                                    }}
                                    title={
                                        <Text size="md" fw={700}>
                                            Help shape what's next!
                                        </Text>
                                    }
                                    withCloseButton
                                    closeButtonProps={{
                                        size: 'lg',
                                    }}
                                    onClose={handleClick}
                                >
                                    <Stack gap="var(--default-spacing)">
                                        <Text size="sm">
                                            This dashboard was built to grow and
                                            improve based on the needs and
                                            experiences of the people who use
                                            it. As you put it to work, we want
                                            to hear what's useful, what's
                                            missing, and what could make it even
                                            better. Your feedback will help
                                            shape where the dashboard goes from
                                            here.
                                        </Text>
                                        <Text size="sm">
                                            For questions or feedback, please
                                            contact the Bureau of Reclamation at{' '}
                                            <Anchor
                                                href={DATA_USBR_MAILTO}
                                                c="blue.8"
                                            >
                                                data@usbr.gov
                                            </Anchor>
                                            .
                                        </Text>
                                    </Stack>
                                </Notification>
                            )}
                            <Popups />
                        </Stack>
                    </Box>
                    <Box
                        className={`${styles.container} ${styles.left} ${styles.bottom}`}
                    >
                        <Popups alignBottom />
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
