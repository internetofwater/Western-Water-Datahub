/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Button, Modal, Tabs, Text, Tooltip } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { About } from '@/features/Help/About';
import { FAQ } from '@/features/Help/FAQ';
import { Glossary } from '@/features/Help/Glossary';
import { Contact } from '@/features/Help/Contact';
import styles from '@/features/Help/Help.module.css';
import useSessionStore from '@/stores/session';
import { HelpTab, Overlay } from '@/stores/session/types';

export const HELP_LOCAL_KEY = 'wwdh-show-help';

const Help: React.FC = () => {
    const [opened, { open, close }] = useDisclosure(false);

    const overlay = useSessionStore((state) => state.overlay);
    const setOverlay = useSessionStore((state) => state.setOverlay);
    const helpTab = useSessionStore((state) => state.helpTab);
    const setHelpTab = useSessionStore((state) => state.setHelpTab);

    const [showHelp, setShowHelp] = useState(false);

    // TODO: investigate issues with initial load
    const [initialLoad, setInitialLoad] = useState(true);

    const mobile = useMediaQuery('(max-width: 899px)');

    useEffect(() => {
        const stored = localStorage.getItem(HELP_LOCAL_KEY);

        const shouldShow = stored === null || stored === 'true';

        if (shouldShow) {
            setOverlay(Overlay.Help);
            setShowHelp(true);
            open();
        } else {
            setOverlay(Overlay.Controls);
            setShowHelp(false);
        }

        setInitialLoad(false);
    }, []);

    useEffect(() => {
        if (initialLoad) {
            return;
        }

        if (overlay === Overlay.Help) {
            open();
        } else {
            close();
        }
    }, [overlay]);

    const handleClick = () => {
        setHelpTab(HelpTab.About);
        setOverlay(Overlay.Help);
    };

    const handleClose = () => {
        const stored = localStorage.getItem(HELP_LOCAL_KEY);
        const shouldShow = stored === null || stored === 'true';

        if (shouldShow) {
            if (mobile) {
                setOverlay(Overlay.Controls);
            } else {
                setOverlay(Overlay.Legend);
            }
        }

        close();
    };

    return (
        <>
            <Tooltip label="Access the about page.">
                <Button onClick={handleClick}>About</Button>
            </Tooltip>

            <Modal
                size="xl"
                classNames={{ header: styles.modalHeader }}
                opened={opened}
                onClose={handleClose}
            >
                <Tabs
                    value={helpTab}
                    className={`${styles.modalBody} ${styles.tabs}`}
                    onChange={(tab) => setHelpTab(tab as HelpTab)}
                >
                    <Tabs.List className={styles.tabsList} grow>
                        <Tabs.Tab value={HelpTab.About}>
                            <Text size="md" fw={700}>
                                About
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab value={HelpTab.Glossary}>
                            <Text size="md" fw={700}>
                                Glossary
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab value={HelpTab.FAQ}>
                            <Text size="md" fw={700}>
                                Frequently Asked Questions
                            </Text>
                        </Tabs.Tab>
                        <Tabs.Tab value={HelpTab.Contact}>
                            <Text size="md" fw={700}>
                                Contact
                            </Text>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value={HelpTab.About}>
                        <About onClose={handleClose} showHelp={showHelp} />
                    </Tabs.Panel>
                    <Tabs.Panel value={HelpTab.Glossary}>
                        <Glossary />
                    </Tabs.Panel>
                    <Tabs.Panel value={HelpTab.FAQ}>
                        <FAQ />
                    </Tabs.Panel>
                    <Tabs.Panel value={HelpTab.Contact}>
                        <Contact />
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </>
    );
};

export default Help;
