/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, BoxProps, CopyButton, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import Check from '@/assets/Check';
import CopyCode from '@/assets/CopyLink';
import styles from '@/components/CopyInput/CopyInput.module.css';

type Props = BoxProps & {
  url: string;
};

const CopyInput: React.FC<Props> = (props) => {
  const { url } = props;
  return (
    <Group justify="center" align="center" className={styles.input}>
      <Text className={styles.text} title={url} size="sm" truncate="end">
        {url}
      </Text>
      <Box component="div" className={styles.buttonWrapper}>
        <CopyButton value={url}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
              <UnstyledButton onClick={copy} className={styles.button}>
                {copied ? <Check /> : <CopyCode />}
              </UnstyledButton>
            </Tooltip>
          )}
        </CopyButton>
      </Box>
    </Group>
  );
};

export default CopyInput;
