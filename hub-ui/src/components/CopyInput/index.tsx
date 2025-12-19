/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Box,
  CopyButton,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import Check from "@/assets/Check";
import CopyLink from "@/assets/CopyLink";
import styles from "@/components/CopyInput/CopyInput.module.css";

type Props = {
  url: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

const CopyInput: React.FC<Props> = (props) => {
  const { url, className = "", size = "md" } = props;
  return (
    <Box
      component="div"
      data-testid="copy-input"
      className={`${styles.input} ${styles[size]} ${className}`}
    >
      <Group justify="center" align="center" p={0} h="100%">
        <Text className={styles.text} title={url} size={size} lineClamp={1}>
          {url}
        </Text>
        <Box component="div" className={styles.buttonWrapper}>
          <CopyButton value={url}>
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
                  {copied ? <Check /> : <CopyLink />}
                </UnstyledButton>
              </Tooltip>
            )}
          </CopyButton>
        </Box>
      </Group>
    </Box>
  );
};

export default CopyInput;
