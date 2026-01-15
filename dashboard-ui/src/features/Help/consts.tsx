/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { Anchor, Text } from '@mantine/core';
import GitHub from '@/icons/logos/Github';
import { LayerId } from '@/features/Map/consts';
import { getLayerName } from '@/features/Map/config';

const description = {
    size: 'md',
};
export type GlossaryEntry = {
    id: string;
    label: ReactNode;
    short: string;
    descriptions: ReactNode[];
};

export const glossaryEntries: GlossaryEntry[] = [
    {
        id: LayerId.NOAARiverForecast,
        label: getLayerName(LayerId.NOAARiverForecast),
        short: 'Forecasted average change in flow for current season against the 30 year normal period.',
        descriptions: [
            <Text {...description}>
                Forecasted average change in flow for current season against the
                30 year normal period.
            </Text>,
        ],
    },
    {
        id: LayerId.Snotel,
        label: getLayerName(LayerId.Snotel),
        short: 'The average snow water equivalent across each HUC06 basin relative to the 30 year average.',
        descriptions: [
            <Text {...description}>
                The average snow water equivalent across each HUC06 basin
                relative to the 30 year average.
            </Text>,
        ],
    },
    {
        id: 'capacity',
        label: 'Capacity',
        short: 'Potential water storage',
        descriptions: [
            <Text {...description}>
                The total volume of water a reservoir can hold.
            </Text>,
        ],
    },
    {
        id: 'storage',
        label: 'Storage',
        short: 'Current water storage',
        descriptions: [
            <Text {...description}>
                The current reservoir storage level on the indicated date.
            </Text>,
        ],
    },
    {
        id: 'average',
        label: '30-year Average',
        short: 'Average water storage on this date',
        descriptions: [
            <Text {...description}>
                The average storage level on this date, measured over the last
                30 years.
            </Text>,
        ],
    },
    // {
    //   id: 'layers',
    //   label: 'Layers',
    //   descriptions: [
    //     <Text {...description}>
    //       Layers are interactive instances of selected datasets. Once a dataset is added to your map
    //       as a layer, you are able to extract the specific parameter (including time extent, if
    //       applicable) and visualize it on the map.
    //     </Text>,
    //   ],
    // },
    {
        id: 'api',
        label: (
            <Anchor
                href="https://asu-awo-pygeoapi-864861257574.us-south1.run.app/"
                target="_blank"
            >
                API
            </Anchor>
        ),
        short: 'This application is powered by an OGC API instance',
        descriptions: [
            <Text {...description}>
                This application is powered by an OGC API instance built in a{' '}
                <Anchor href="https://pygeoapi.io/" target="_blank">
                    pygeoapi
                </Anchor>{' '}
                server. Click on any "API" links throughout the application to
                visit the backend page for that item.
            </Text>,
        ],
    },
    // {
    //   id: 'links',
    //   label: 'Links',
    //   descriptions: [
    //     <Text {...description}>
    //       Use the Links modal to explore features in more detail. Find file downloads, explore data,
    //       and retrieve API requests used to fetch the same data visualized on the map and in the
    //       charts.
    //     </Text>,
    //   ],
    // },
];

type Bullet = {
    label?: string;
    content: string;
};

type QA = {
    id: string;
    question: string;
    answer: string;
    bullets?: Bullet[];
};

export const questions: QA[] = [
    // {
    //     id: 'grid',
    //     question: 'What are the available gridded datasets?',
    //     answer: 'Gridded datasets provide continuous spatial coverage with estimated values for every cell across a geographic area. The following gridded datasets are available:',
    //     bullets: [
    //         {
    //             label: 'National Water Model Channel Routing Output ',
    //             content:
    //                 '- contains simulated flow and channel-related variables for river and stream segments, representing the movement of water through the channel network.',
    //         },
    //         {
    //             label: 'National Water Model Land Data Assimilation System Output ',
    //             content:
    //                 '- aims to produce high quality fields of land surface states and fluxes by integrating satellite and ground-based observational data products.',
    //         },
    //         {
    //             label: 'National Water Model Reach to Reach Routing Output ',
    //             content:
    //                 '- provides simulated streamflow and related hydrologic variables for millions of individual river and stream reaches across the U.S., representing how water is routed downstream through the national river network.',
    //         },
    //         {
    //             label: 'Parameter-elevation Regressions on Independent Slopes Model (PRISM) ',
    //             content:
    //                 '- provides high-resolution climate data including precipitation and temperature estimates across complex terrain.',
    //         },
    //     ],
    // },
];

type Contact = {
    id: string;
    image: ReactNode;
    body: string;
    link: string;
};

export const contacts: Contact[] = [
    {
        id: 'github',
        image: <GitHub />,
        body: 'Access the repository containing the source code for the Western Water Datahub. Contribute new features, report issues, and learn more about how this application was built.',
        link: 'https://github.com/internetofwater/Western-Water-Datahub',
    },
];
