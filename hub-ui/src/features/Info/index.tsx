/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ActionIcon, Text, Tooltip } from "@mantine/core";
import Help from "@/assets/Help";
import styles from "@/features/Info/Info.module.css";
import useSessionStore from "@/stores/session";
import { HelpTab, Modal } from "@/stores/session/types";

const Info: React.FC = () => {
  const setOpenModal = useSessionStore((state) => state.setOpenModal);
  const setHelpTab = useSessionStore((state) => state.setHelpTab);

  const handleClick = () => {
    setHelpTab(HelpTab.Glossary);
    setOpenModal(Modal.Help);
  };

  const help =
    "Access the glossary, frequently asked questions (FAQ), and welcome screen.";

  const helpText = <Text size="sm">{help}</Text>;

  return (
    <Tooltip label={helpText}>
      <ActionIcon
        aria-label={help}
        size="lg"
        onClick={() => handleClick()}
        className={styles.infoButton}
      >
        <Help />
      </ActionIcon>
    </Tooltip>
  );
};

export default Info;
