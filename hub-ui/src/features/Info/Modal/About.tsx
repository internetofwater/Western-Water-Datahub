/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';
import { Anchor, Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import useSessionStore from '@/stores/session';

type Props = {
  showHelp: boolean;
};

export const About: React.FC<Props> = (props) => {
  const { showHelp } = props;

  const setOpenModal = useSessionStore((state) => state.setOpenModal);

  const [showHelpAgain, setShowHelpAgain] = useState(showHelp);

  const handleDontShowClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.currentTarget;
    if (checked) {
      localStorage.setItem('showHelp', 'false');
      setShowHelpAgain(false);
    } else {
      localStorage.setItem('showHelp', 'true');
      setShowHelpAgain(true);
    }
  };

  const paragraph = {
    size: 'md',
  };

  return (
    <Stack>
      <Stack
        px="var(--default-spacing)"
        mb="calc(var(--default-spacing) * 2)"
        gap="calc(var(--default-spacing) * 2"
      >
        <Text {...paragraph}>
          The Western Water Data Hub is an interface for accessing water-related data for the
          western United States from multiple data providers and sources. It provides streamlined
          access to data through Open Geospatial Consortium (OGC) Application Programming Interface
          (API) standards, making it easier to retrieve and work with data from a variety of
          providers and data sources.
        </Text>
        <Text {...paragraph}>
          The hub serves as a user-friendly interface for the{' '}
          <Anchor size="md" href="https://api.wwdh.internetofwater.app/" target="_blank" c="blue">
            Western Water Data API
          </Anchor>
          , allowing you to browse data sources, preview available data, and build API requests.
        </Text>
        <Text {...paragraph}>
          <strong>Note:</strong> The hub is currently in active development. Some features may not
          work as expected and the presentation and availability of data may change.
        </Text>
      </Stack>
      <Group justify="space-between">
        <Button onClick={() => setOpenModal(null)}>Continue</Button>
        <Checkbox
          checked={!showHelpAgain}
          onChange={(event) => handleDontShowClick(event)}
          label="Don't show again"
        />
      </Group>
    </Stack>
  );
};
