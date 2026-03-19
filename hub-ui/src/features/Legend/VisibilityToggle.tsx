/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ActionIcon, ActionIconProps } from "@mantine/core";
import Invisible from "@/assets/Invisible";
import Visible from "@/assets/Visible";
import styles from "@/features/Legend/Legend.module.css";

type Props = ActionIconProps & {
  visible: boolean;
  onClick: () => void;
};

export const VisibilityToggle: React.FC<Props> = (props) => {
  const { visible, onClick } = props;

  return (
    <ActionIcon
      onClick={onClick}
      classNames={{
        root: styles.actionIconRoot,
        icon: styles.actionIcon,
      }}
    >
      {visible ? <Visible /> : <Invisible />}
    </ActionIcon>
  );
};
