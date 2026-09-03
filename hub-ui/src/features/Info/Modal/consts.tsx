/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReactNode } from 'react';
import { Anchor, Image, Text, TextProps } from '@mantine/core';
import GitHub from '@/assets/logos/Github';

type Contact = {
  id: string;
  image?: ReactNode;
  role: string;
  featured?: boolean;
  body: ReactNode;
  link?: {
    text: string;
    href: string;
  };
};

export const content: TextProps = {
  size: 'sm',
  span: true,
};

export const DATA_USBR_MAILTO =
  'mailto:data@usbr.gov?subject=%5BWWDH%20Hub%20Feedback%5D%20-%20Placeholder&body=Please%20update%20the%20%22Placeholder%22%20portion%20of%20the%20subject%20line.%20Keeping%20%22%5BWWDH%20Hub%20Feedback%5D%22%20in%20the%20subject%20will%20help%20us%20get%20back%20to%20you%20sooner.%0D%0A%0D%0APlease%20replace%20this%20email%20body%20with%20your%20feedback.%20';

export const contacts: Contact[] = [
  {
    id: 'cgs',
    image: <Image src="/cgs-logo-color.png" />,
    role: 'Design & Development',
    featured: true,
    body: (
      <Text {...content}>
        This application follows{' '}
        <Anchor
          target="_blank"
          href="https://internetofwater.org/internet-of-water-principles/"
          c="blue.8"
        >
          Internet of Water Principles
        </Anchor>{' '}
        for interoperable water data. Application design and development provided by the{' '}
        <Anchor target="_blank" href="https://cgsearth.org/" c="blue.8">
          Center for Geospatial Solutions
        </Anchor>{' '}
        at the{' '}
        <Anchor target="_blank" href="https://www.lincolninst.edu/" c="blue.8">
          Lincoln Institute of Land Policy
        </Anchor>
        .
      </Text>
    ),
  },
  {
    id: 'email-bor',
    image: <Image src="/BofR-logo-dark.png" />,
    role: 'Questions & Feedback',
    body: (
      <Text {...content}>
        For questions or feedback on the Western Water Data Hub, please contact the Bureau of
        Reclamation at{' '}
        <Anchor {...content} target="_blank" href="data@usbr.gov" c="blue.8">
          data@usbr.gov
        </Anchor>
        .
      </Text>
    ),
    link: {
      text: 'Email Bureau of Reclamation',
      href: DATA_USBR_MAILTO,
    },
  },
  {
    id: 'github',
    image: <GitHub />,
    role: 'Source Code & Contributions',
    body: (
      <Text {...content}>
        Access the repository containing the source code for the Western Water Datahub. Contribute
        new features, report issues, and learn more about how this application was built.
      </Text>
    ),
    link: {
      text: 'View Repository',
      href: 'https://github.com/internetofwater/Western-Water-Datahub',
    },
  },
];
