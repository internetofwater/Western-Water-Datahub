/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment, useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Divider,
  Popover,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import Calendar from "@/assets/Calendar";
import { Entry } from "@/features/Time/Entry";
import styles from "@/features/Time/Time.module.css";
import { TLayer } from "@/stores/main/types";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";

type Props = {
  layers: TLayer[];
};

const Time: React.FC<Props> = (props) => {
  const { layers } = props;

  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const [show, setShow] = useState(false);

  const handleShow = (show: boolean) => {
    setOverlay(show ? EOverlay.Date : null);
    setShow(show);
  };

  useEffect(() => {
    if (overlay !== EOverlay.Date) {
      setShow(false);
    }
  }, [overlay]);

  return (
    <Popover
      opened={show}
      onChange={setShow}
      position="right-start"
      closeOnClickOutside={false}
      keepMounted
    >
      <Popover.Target>
        <Tooltip label="Change visualized dates." disabled={show}>
          <ActionIcon
            className={styles.timesButton}
            size="lg"
            onClick={() => handleShow(!show)}
          >
            <Calendar />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack
          gap="var(--default-spacing)"
          className={`${styles.container} ${styles.dateSelectorContainer}`}
          align="flex-start"
        >
          <Title order={5} size="h3">
            Visualized Dates
          </Title>
          <Text c="dimmed" size="sm">
            Dates shown are UTC
          </Text>
          {layers.map((layer) => (
            <Fragment key={`date-selector-${layer}`}>
              <Entry layer={layer} />
              <Divider />
            </Fragment>
          ))}
          <Button size="sm" onClick={() => handleShow(false)}>
            Ok
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default Time;
