/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';
import { Anchor, Box, HoverCard, Image, Text } from '@mantine/core';
import styles from '@/components/Badge/Badge.module.css';

/**
 * Renders Internet of Water (IoW) badge.
 *
 * Includes a grayscale bookmark with the IoW logo. On hover, the bookmark and
 * logo transition to color with an open `HoverCard` component linking out to
 * the Internet of Water Principles website.
 */
export const Badge: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HoverCard
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      width={220}
      shadow="md"
      withArrow
      position="right"
      arrowSize={12}
    >
      <HoverCard.Target>
        <Box className={`${styles.badge} ${isOpen && styles.active}`}>
          {/* Bookmark shape */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="37"
            height="26"
            viewBox="0 0 37 26"
            className={styles.bookmark}
          >
            <path d="M35.7002 0H0V26H35.7002C36.5744 26 37.0277 24.9573 36.4316 24.318L26.5135 13.682C26.1553 13.2979 26.1553 12.7021 26.5135 12.318L36.4316 1.68199C37.0277 1.04266 36.5744 0 35.7002 0Z" />
          </svg>

          <Box>
            <Image
              src="iow-logo-grayscale.png"
              alt="Internet of Water logo"
              className={`${styles.logo} ${styles.gray}`}
            />

            <Image
              src="iow-logo-color.png"
              alt="Internet of Water logo"
              className={`${styles.logo} ${styles.color}`}
            />
          </Box>
        </Box>
      </HoverCard.Target>

      <HoverCard.Dropdown
        p="xs"
        bg="var(--badge-dropdown-bg)"
        c="var(--badge-dropdown-c)"
        style={{
          '--badge-dropdown-bg': '#1a2956',
          '--badge-dropdown-c': '#ffffff',
          '--badge-dropdown-anchor-c': '#11b1aa',
        }}
      >
        <Text size="sm">
          Developed in alignment with the{' '}
          <Anchor
            c="var(--badge-dropdown-anchor-c) !important"
            href="https://internetofwater.org/internet-of-water-principles"
            target="_blank"
            underline="always"
          >
            Internet of Water Principles
          </Anchor>
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
