/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { Modal as ModalComponent, Tabs, Title } from "@mantine/core";
import styles from "@/features/Info/Info.module.css";
import { About } from "@/features/Info/Modal/About";
import { FAQ } from "@/features/Info/Modal/FAQ";
import { Glossary } from "@/features/Info/Modal/Glossary";
import useSessionStore from "@/stores/session";
import { HelpTab, Modal as ModalEnum } from "@/stores/session/types";

const Modal: React.FC = () => {
  const openModal = useSessionStore((state) => state.openModal);
  const setOpenModal = useSessionStore((state) => state.setOpenModal);
  const helpTab = useSessionStore((state) => state.helpTab);
  const setHelpTab = useSessionStore((state) => state.setHelpTab);

  // local state to trigger render cycle
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const showHelp = localStorage.getItem("showHelp");
    if (!showHelp || showHelp === "true") {
      setOpenModal(ModalEnum.Help);
      setShowHelp(true);
    } else if (showHelp === "false") {
      setShowHelp(false);
    }
  }, []);

  return (
    <ModalComponent
      size="xl"
      title={
        <Title order={3} size="h4">
          Help
        </Title>
      }
      opened={openModal === ModalEnum.Help}
      onClose={() => setOpenModal(null)}
    >
      <Tabs value={helpTab} onChange={(tab) => setHelpTab(tab as HelpTab)}>
        <Tabs.List grow className={styles.tabList}>
          <Tabs.Tab value={HelpTab.About}>About</Tabs.Tab>
          <Tabs.Tab value={HelpTab.Glossary}>Glossary</Tabs.Tab>
          <Tabs.Tab value={HelpTab.FAQ}>Frequently Asked Questions</Tabs.Tab>
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
      </Tabs>
    </ModalComponent>
  );
};

export default Modal;
