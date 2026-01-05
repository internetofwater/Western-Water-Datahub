/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, CopyButton, Group, Tooltip, UnstyledButton } from "@mantine/core";
import Check from "@/assets/Check";
import CopyCode from "@/assets/CopyCode";
import styles from "@/components/Code/Code.module.css";

type Props = {
  code: string;
  display?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

const Code: React.FC<Props> = (props) => {
  const { code, display = null, size = "md" } = props;
  return (
    <Box
      component="div"
      data-testid="code-copy"
      className={`${styles.input} ${styles[size]}`}
    >
      <Group justify="center" align="center" p={0} h="100%">
        <Box component="pre" className={styles.code} data-testid="code-block">
          {display ?? code}
        </Box>
        <Box component="div" className={styles.buttonWrapper}>
          <CopyButton value={code}>
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy"}
                withArrow
                position="right"
              >
                <UnstyledButton
                  onClick={copy}
                  className={`${styles.button} ${styles[size]}`}
                >
                  {copied ? <Check /> : <CopyCode />}
                </UnstyledButton>
              </Tooltip>
            )}
          </CopyButton>
        </Box>
      </Group>
    </Box>
  );
};

export default Code;
