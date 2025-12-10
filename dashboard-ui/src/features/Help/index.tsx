/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Button, Modal, Tabs, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { About } from '@/features/Help/About';
import { FAQ } from '@/features/Help/FAQ';
import { Glossary } from '@/features/Help/Glossary';
import styles from '@/features/Help/Help.module.css';
import useSessionStore from '@/stores/session';
import { HelpTab, Overlay } from '@/stores/session/types';
import { Contact } from '@/features/Help/Contact';

export const INFO_LOCAL_KEY = 'awo-show-info';

const Help: React.FC = () => {
    const [opened, { open, close }] = useDisclosure(false, {
        onClose: () => {
            setOverlay(null);
        },
    });

    const overlay = useSessionStore((store) => store.overlay);
    const setOverlay = useSessionStore((store) => store.setOverlay);
    const helpTab = useSessionStore((store) => store.helpTab);
    const setHelpTab = useSessionStore((store) => store.setHelpTab);

    // local state to trigger render cycle
    const [showHelp, setShowHelp] = useState(false);
    // const onLoad = useRef(true)

    useEffect(() => {
        if (overlay !== Overlay.Help) {
            close();
        } else if (!opened) {
            open();
        }
    }, [overlay]);

    useEffect(() => {
        const showHelp = localStorage.getItem(INFO_LOCAL_KEY);
        if (!showHelp || showHelp === 'true') {
            setOverlay(Overlay.Help);
            setShowHelp(true);
        } else if (showHelp === 'false') {
            setShowHelp(false);
        }
    }, []);

    const handleClick = () => {
        setHelpTab(HelpTab.About);
        setOverlay(Overlay.Help);
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
                onClose={close}
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
                        <About showHelp={showHelp} />
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
