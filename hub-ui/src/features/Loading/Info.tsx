/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { PropsWithChildren } from 'react';
import {
  Box,
  HoverCard,
  HoverCardDropdown,
  HoverCardTarget,
  List,
  ListItem,
  Text,
  Title,
} from '@mantine/core';
import styles from '@/features/Loading/Loading.module.css';

type Props = {
  loadingTexts: string[];
  desktop: boolean;
};

export const Info: React.FC<PropsWithChildren<Props>> = (props) => {
  const { loadingTexts, desktop, children } = props;

  return (
    <HoverCard width={300} shadow="md" position="top" withArrow>
      <HoverCardTarget>
        <Box
          w="100%"
          className={`${styles.loadingBar} ${desktop ? styles.desktop : styles.mobile}`}
        >
          {children}
        </Box>
      </HoverCardTarget>
      <HoverCardDropdown>
        <Title order={4}>Loading:</Title>
        <List>
          {loadingTexts.map((item, index) => (
            <ListItem key={index}>
              <Text size="sm">{item}</Text>
            </ListItem>
          ))}
        </List>
      </HoverCardDropdown>
    </HoverCard>
  );
};
