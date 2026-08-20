/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { Modal as ModalComponent, Tabs, Text } from '@mantine/core';
import styles from '@/features/Info/Info.module.css';
import { About } from '@/features/Info/Modal/About';
import { Contact } from '@/features/Info/Modal/Contact';
import { FAQ } from '@/features/Info/Modal/FAQ';
import { Glossary } from '@/features/Info/Modal/Glossary';
import useSessionStore from '@/stores/session';
import { EHelpTab, EModal as ModalEnum } from '@/stores/session/types';

const Modal: React.FC = () => {
  const openModal = useSessionStore((state) => state.openModal);
  const setOpenModal = useSessionStore((state) => state.setOpenModal);
  const helpTab = useSessionStore((state) => state.helpTab);
  const setHelpTab = useSessionStore((state) => state.setHelpTab);

  // local state to trigger render cycle
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const showHelp = localStorage.getItem('showHelp');
    if (!showHelp || showHelp === 'true') {
      setOpenModal(ModalEnum.Help);
      setShowHelp(true);
    } else if (showHelp === 'false') {
      setShowHelp(false);
    }
  }, []);

  const tabStyle = {
    size: 'md',
    fw: 700,
  };

  return (
    <ModalComponent
      size="xl"
      closeButtonProps={{ 'aria-label': 'Close information modal' }}
      opened={openModal === ModalEnum.Help}
      onClose={() => setOpenModal(null)}
    >
      <Tabs
        value={helpTab}
        className={[styles.body, styles.tabs].join(' ')}
        onChange={(tab) => setHelpTab(tab as EHelpTab)}
      >
        <Tabs.List grow className={styles.list}>
          <Tabs.Tab value={EHelpTab.About}>
            <Text {...tabStyle}>About</Text>
          </Tabs.Tab>
          <Tabs.Tab disabled value={EHelpTab.Glossary}>
            <Text {...tabStyle}>Documentation</Text>
          </Tabs.Tab>
          <Tabs.Tab disabled value={EHelpTab.FAQ}>
            <Text {...tabStyle}>Frequently Asked Questions</Text>
          </Tabs.Tab>
          <Tabs.Tab value={EHelpTab.Contact}>
            <Text {...tabStyle}>Contact Us</Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={EHelpTab.About}>
          <About showHelp={showHelp} />
        </Tabs.Panel>
        <Tabs.Panel value={EHelpTab.Glossary}>
          <Glossary />
        </Tabs.Panel>
        <Tabs.Panel value={EHelpTab.FAQ}>
          <FAQ />
        </Tabs.Panel>
        <Tabs.Panel value={EHelpTab.Contact}>
          <Contact />
        </Tabs.Panel>
      </Tabs>
    </ModalComponent>
  );
};

export default Modal;
