/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import {
    Anchor,
    AnchorProps,
    Stack,
    Text,
    TextProps,
    TitleProps,
} from '@mantine/core';
import GitHub from '@/icons/logos/Github';
import { LayerId } from '@/features/Map/consts';
import { getLayerName } from '@/features/Map/config';

export type GlossaryBase = {
    id: string;
    label?: ReactNode;
};

export type GlossaryBaseWDesc = GlossaryBase & {
    description?: ReactNode;
};

export type GlossaryEntry = GlossaryBase & {
    content: ReactNode;
};

export type GlossarySubSection = GlossaryBaseWDesc & {
    entries: GlossaryEntry[];
};

export type GlossarySection = GlossaryBaseWDesc & {
    subSections: GlossarySubSection[];
};

export const sectionLabel: TitleProps = {
    order: 4,
};

export const sectionDescription: TextProps = {
    size: 'md',
};

export const subSectionLabel: TitleProps = {
    order: 5,
};

export const subSectionDescription: TextProps = {
    size: 'sm',
};

export const content: TextProps = {
    size: 'sm',
    span: true,
};

const getAnchor = (
    text: string,
    href: string,
    size: AnchorProps['size'] = 'sm'
) => {
    return (
        <Anchor size={size} href={href} target="_blank" c="blue">
            {text}
        </Anchor>
    );
};

export const sections: GlossarySection[] = [
    {
        id: 'reference-data-base-layers',
        label: 'Reference Data and Base Layers',
        description:
            'The Dashboard can display various types of reference data and base layers to provide additional context for reservoir conditions.',
        subSections: [
            {
                id: 'reference-data',
                label: 'Reference Data',
                entries: [
                    {
                        id: LayerId.NOAARiverForecast,
                        label: getLayerName(LayerId.NOAARiverForecast),
                        content: (
                            <>
                                <Text {...content}>
                                    The forecasted seasonal streamflow volume at
                                    each forecast point divided by the average
                                    streamflow volume for the season at that
                                    forecast point, expressed as a percentage.
                                    Forecasts are provided by the National
                                    Oceanic and Atmospheric Administration
                                    (NOAA) River Forecast Centers (RFCs). The
                                    season is typically April 1 through July 31,
                                    but&nbsp;
                                    {getAnchor(
                                        'differs for some forecast points',
                                        'https://www.cbrfc.noaa.gov/dbdata/station/espgraph/list/esplist.html'
                                    )}
                                    . The historical averaging period is
                                    1991-2020 (Calendar Years).Forecasts
                                    typically represent unregulated streamflow,
                                    meaning they do not account for the water
                                    that may be diverted into or out of the
                                    stream, or stored in reservoirs upstream
                                    during the runoff season. To learn more
                                    about water supply forecasts, and how they
                                    are developed, visit the following websites:
                                </Text>
                                <br />
                                {getAnchor(
                                    'Colorado Basin River Forecast Center',
                                    'https://www.cbrfc.noaa.gov/wsup/doc/doc.html'
                                )}
                                <br />
                                {getAnchor(
                                    'Northwest River Forecast Center',
                                    'https://www.nwrfc.noaa.gov/ws/ws_info.php'
                                )}
                            </>
                        ),
                    },
                    {
                        id: LayerId.Snotel,
                        label: getLayerName(LayerId.Snotel),
                        content:
                            'The average snow water equivalent across each 6-digit Hydrologic Unit divided by the 30-year average for that basin, expressed as a percentage. The 30-year averaging period is 1991-2020. Snow Water Equivalent (SWE) is a measurement of the amount of water contained in a snowpack. It is the depth of water that would theoretically result if the whole snowpack instantaneously melted.',
                    },
                ],
            },
            {
                id: 'base-layers',
                label: 'Base Layers',
                entries: [
                    {
                        id: LayerId.NOAAPrecipSixToTen,
                        label: getLayerName(LayerId.NOAAPrecipSixToTen),
                        content: (
                            <Text {...content}>
                                The 6-10 Day Precipitation Outlook map from the
                                NOAA National Weather Service Climate Prediction
                                Center. The map indicates the probability
                                (percent chance) of precipitation above, near,
                                or below normal. For more information, see
                                &nbsp;
                                {getAnchor(
                                    'Source',
                                    'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/cpc_6_10_day_outlk/MapServer/1'
                                )}
                                &nbsp;|&nbsp;
                                {getAnchor(
                                    'Methodology',
                                    'https://www.cpc.ncep.noaa.gov/products/predictions/610day/index.php'
                                )}
                            </Text>
                        ),
                    },
                    {
                        id: LayerId.NOAATempSixToTen,
                        label: getLayerName(LayerId.NOAATempSixToTen),
                        content: (
                            <Text {...content}>
                                The 6-10 Day Temperature Outlook map from the
                                NOAA National Weather Service Climate Prediction
                                Center. The map indicates the probability
                                (percent chance) of temperatures above, near, or
                                below normal. For more information, see&nbsp;
                                {getAnchor(
                                    'Source',
                                    'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/cpc_6_10_day_outlk/MapServer/0'
                                )}
                                &nbsp;|&nbsp;
                                {getAnchor(
                                    'Methodology',
                                    'https://www.cpc.ncep.noaa.gov/products/predictions/610day/index.php'
                                )}
                            </Text>
                        ),
                    },
                ],
            },
            {
                id: 'boundaries',
                label: 'Boundaries',
                entries: [
                    {
                        id: LayerId.RegionsReference,
                        label: 'DOI Region Boundaries',
                        content:
                            'The boundaries of Department of the Interior (DOI) Unified Regions. The dashboard only displays the boundaries of the DOI regions in the western US (Columbia-Pacific Northwest, California-Great Basin, Missouri Basin, Upper Colorado Basin, Lower Colorado Basin, and Arkansas-Rio Grande-Texas Gulf).',
                    },
                    {
                        id: LayerId.BasinsReference,
                        label: 'Basin (HUC2) Boundaries',
                        content:
                            'The boundaries of 2-digit Hydrologic Units. Although the Watershed Boundary Dataset refers to these as “Regions”, they are labeled as “Basin (HUC2) Boundaries” in the Dashboard to avoid confusion with the DOI Region Boundaries.',
                    },
                    {
                        id: LayerId.StatesReference,
                        label: 'State Boundaries',
                        content:
                            'The boundaries of U.S. states. Only the 17 western states are displayed.',
                    },
                ],
            },
        ],
    },
    {
        id: 'glossary',
        label: 'Glossary',
        description:
            "The glossary contains definitions for general terms you'll encounter throughout the Dashboard.",
        subSections: [
            {
                id: 'glossary-inner',
                entries: [
                    {
                        id: 'acre-foot',
                        label: 'Acre-Foot (AF)',
                        content:
                            'The volume of water that would cover one acre to a depth of one foot. An acre-foot is a common way to measure water volumes for reservoirs and large-scale water use, such as for irrigation.',
                    },
                    {
                        id: 'hydrologic-unit',
                        label: 'Hydrologic Unit (HU)',
                        content: (
                            <Text {...content}>
                                An area of the landscape that drains to a
                                portion of the stream network, such as a basin
                                or watershed. Hydrologic Units are defined by
                                the United States Geological Survey's Watershed
                                Boundary Dataset (WBD). The Watershed Boundary
                                Dataset divides and sub-divides the United
                                States into successively smaller hydrologic
                                units. Hydrologic units are arranged or nested
                                within each other, from the largest geographic
                                area (regions) to progressively smaller areas.
                                Each hydrologic unit is identified by a
                                unique&nbsp;
                                <Text {...content} fw={700} component="strong">
                                    hydrologic unit code (HUC)
                                </Text>
                                &nbsp;consisting of two to 12 digits based on
                                the levels of classification in the hydrologic
                                unit system. For more information about
                                hydrologic units and HUCs, see&nbsp;
                                {getAnchor(
                                    'Hydrologic Units of the United States',
                                    'https://water.usgs.gov/themes/hydrologic-units/'
                                )}
                                .
                            </Text>
                        ),
                    },
                    {
                        id: 'swe',
                        label: 'Snow Water Equivalent (SWE)',
                        content:
                            'A measurement of the amount of water contained in a snowpack. It is the depth of water that would theoretically result if the whole snowpack instantaneously melted.',
                    },
                    {
                        id: 'water-year',
                        label: 'Water Year (WY)',
                        content:
                            'The 12-month period from October 1st of a given year through September 30th of the following year. The water year is designated by the calendar year in which it ends. For example, the period from October 1, 1998 through September 30, 1999 is called WY 1999.',
                    },
                ],
            },
        ],
    },
    {
        id: 'understanding',
        label: 'Understanding Reservoir Information in the Dashboard',
        description:
            "You can use the reservoir information in the Dashboard to get an understanding of water supply and flood conditions across the West for the selected date. Here's how it works:",
        subSections: [
            {
                id: 'understanding-inner',
                entries: [
                    {
                        id: 'reservoir-storage',
                        content: (
                            <Text {...content}>
                                <Text {...content} fw={700} component="strong">
                                    Reservoir storage
                                </Text>
                                &nbsp;tells you how much water is stored in the
                                reservoir on the selected date. Depending on the
                                reservoir and its authorized purposes, this
                                water may be used for irrigation, power,
                                municipal and industrial use, fish and wildlife,
                                navigation, recreation, water quality, flood
                                control, and other purposes.
                            </Text>
                        ),
                    },
                    {
                        id: 'reservoir-capacity',
                        content: (
                            <Text {...content}>
                                <Text {...content} fw={700} component="strong">
                                    Reservoir capacity
                                </Text>
                                &nbsp;values shown along with the reservoir
                                storage values provide context for the storage
                                values, indicating the amount of water that can
                                be stored in a reservoir based on physical
                                constraints and operating agreements.
                            </Text>
                        ),
                    },
                    {
                        id: 'percent-full',
                        content: (
                            <Text {...content}>
                                Combining reservoir storage with capacity gives
                                you the{' '}
                                <Text {...content} fw={700} component="strong">
                                    percent full
                                </Text>
                                , which helps you understand the amount of
                                storage relative to physical constraints and
                                operating agreements. A word of caution:
                                Depending on the time of year and how a
                                particular reservoir is operated, it may or may
                                not be “better” to be more full. For example,
                                reservoirs may be kept low during flood season
                                so that the storage space can be filled when a
                                flood occurs, then emptied again to prepare for
                                the next flood.
                            </Text>
                        ),
                    },
                    {
                        id: 'percent-average',
                        content: (
                            <Text {...content}>
                                Combining reservoir storage with the historical
                                average storage for the specified date gives you
                                the{' '}
                                <Text {...content} fw={700} component="strong">
                                    percent of average
                                </Text>
                                , which helps you understand the amount of
                                storage relative to historical conditions. This
                                is especially helpful for reservoirs that are
                                operated for different purposes throughout the
                                year.
                            </Text>
                        ),
                    },
                ],
            },
            {
                id: 'wondering',
                description: (
                    <Text {...subSectionDescription}>
                        <Text {...subSectionDescription} fw={700} span>
                            Wondering what all these terms mean?
                        </Text>
                        &nbsp;Here are the key reservoir storage and capacity
                        terms you'll see in the Dashboard, followed by
                        additional definitions of reservoir capacity terms.
                    </Text>
                ),
                entries: [
                    {
                        id: 'capacity',
                        label: 'Capacity',
                        content: (
                            <Text {...content}>
                                The volume of water a reservoir can hold.
                                Capacities are defined for specified portions of
                                the reservoir, typically either from the bottom
                                of the reservoir to a specified storage level or
                                between two reservoir storage levels. The
                                dashboard shows either Total Capacity or Active
                                Capacity, depending on the reservoir.
                                <Text {...content} fw={700} component="strong">
                                    Total Capacity
                                </Text>
                                &nbsp;is the total volume of water that can be
                                impounded by the reservoir, not including&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    surcharge capacity
                                </Text>
                                .&nbsp;
                                <Text {...content} fw={700} component="strong">
                                    Active Capacity
                                </Text>
                                &nbsp;is the volume of water that can be
                                regulated by the reservoir.
                            </Text>
                        ),
                    },
                    {
                        id: 'storage',
                        label: 'Storage',
                        content: (
                            <Text {...content}>
                                The reservoir storage volume on the indicated
                                date. The dashboard shows either Total Storage
                                or Active Storage, depending on the
                                reservoir.&nbsp;
                                <Text {...content} fw={700} component="strong">
                                    Total Storage
                                </Text>
                                &nbsp;is the total volume of water stored in the
                                reservoir on the indicated date. Total storage
                                may include storage in the surcharge capacity,
                                above the uncontrolled spillway crest or the top
                                of the spillway gates.&nbsp;
                                <Text {...content} fw={700} component="strong">
                                    Active Storage
                                </Text>
                                &nbsp;is the volume of water stored in the
                                reservoir above the top of&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    inactive storage capacity
                                </Text>
                                &nbsp;on the indicated date. Active storage may
                                include storage in the surcharge capacity, above
                                the uncontrolled spillway crest or the top of
                                the spillway gates.
                            </Text>
                        ),
                    },
                    {
                        id: 'thir-year-avg',
                        label: '30-year Average Storage',
                        content:
                            'The average storage volume on the specified date, measured over the 30-year period from October 1, 1990 through September 30, 2020.',
                    },
                    {
                        id: 'low-ten-pct',
                        label: (
                            <Text {...content} fw={700}>
                                Low (10<sup>th</sup> Percentile):
                            </Text>
                        ),
                        content:
                            'The storage volume below which only 10% of historical observations fall for the specified date, based on the 30-year period (October 1 1990 - September 30, 2020). Storage at or below this level indicates unusually low conditions.',
                    },
                    {
                        id: 'high-nine-pct',
                        label: (
                            <Text {...content} fw={700}>
                                High (90<sup>th</sup> Percentile):
                            </Text>
                        ),
                        content:
                            'The storage volume below which 90% of historical observations fall for the specified date, based on the 30-year period (October 1, 1990 - September 30 2020). Storage at or above this level indicates unusually high conditions.',
                    },
                    {
                        id: 'pct-full',
                        label: 'Percent Full',
                        content:
                            'Storage divided by Capacity, expressed as a percentage. For reservoirs with storage provided as Total Storage, the Percent Full is calculated using the Total Capacity. For Reservoirs with storage provided as Active Storage, the Percent Full is calculated using the Active Capacity.',
                    },
                    {
                        id: 'pct-avg',
                        label: 'Percent of Average',
                        content:
                            'Storage divided by 30-year Average Storage, expressed as a percentage.',
                    },
                ],
            },
            {
                id: 'additional-capacity',
                label: 'Additional Capacity Definitions',
                entries: [
                    {
                        id: 'surcharge-cap',
                        label: 'Surcharge Capacity',
                        content:
                            'The reservoir capacity provided for use in passing the inflow design flood through the reservoir. It is the reservoir capacity between the maximum water surface elevation and the highest of the following elevations: (1) the top of exclusive flood control capacity, (2) top of joint use capacity, or (3) top of active conservation capacity.',
                    },
                    {
                        id: 'total-cap',
                        label: 'Total Capacity',
                        content: (
                            <Text {...content}>
                                The total volume of water that can be impounded
                                by the reservoir, not including&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    surcharge capacity
                                </Text>
                                . The elevation associated with the total
                                capacity is typically the elevation of the&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    uncontrolled spillway crest
                                </Text>
                                &nbsp;or the top of the&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    spillway gates
                                </Text>
                                . Total capacity is the reservoir capacity up to
                                the highest of the top of active&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    conservation capacity
                                </Text>
                                ,&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    joint use capacity
                                </Text>
                                &nbsp;(if present), and&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    exclusive flood control capacity
                                </Text>
                                (if present).
                            </Text>
                        ),
                    },
                    {
                        id: 'active-cap',
                        label: 'Active Capacity',
                        content: (
                            <Text {...content}>
                                The volume of water regulated by the reservoir
                                for irrigation, power, municipal and industrial
                                use, fish and wildlife, navigation, recreation,
                                water quality, flood control, and other
                                purposes. Active capacity is the reservoir
                                capacity between the top of the&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    inactive storage capacity
                                </Text>
                                &nbsp;and the highest of the top of the&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    active conservation capacity
                                </Text>
                                ,&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    joint use capacity
                                </Text>
                                &nbsp;(if present), and&nbsp;
                                <Text {...content} fs="italic" component="i">
                                    exclusive flood control capacity
                                </Text>
                                &nbsp;(if present).
                            </Text>
                        ),
                    },
                    {
                        id: 'excl-fld-contr-cap',
                        label: 'Exclusive Flood Control Capacity',
                        content:
                            'The reservoir capacity assigned to the sole purpose of regulating flood inflows to reduce possible damage downstream. In some instances, the top of exclusive flood control capacity is above the maximum controllable water surface elevation.',
                    },
                    {
                        id: 'joint-use-cap',
                        label: 'Joint Use Capacity',
                        content:
                            'The reservoir capacity assigned to flood control during certain periods of the year and to conservation purposes during other periods of the year.',
                    },
                    {
                        id: 'active-cons-cap',
                        label: 'Active Conservation Capacity',
                        content:
                            'The reservoir capacity assigned to regulate reservoir inflow for irrigation, power, municipal and industrial use, fish and wildlife, navigation, recreation, water quality, and other purposes. It does not include exclusive flood control or joint use capacity. It extends from the top of the active conservation capacity to the top of the inactive capacity.',
                    },
                    {
                        id: 'inactive-cap',
                        label: 'Inactive Capacity',
                        content:
                            'The reservoir capacity exclusive of and above the dead storage from which water is normally not available because of operating agreements or physical restrictions. Under abnormal conditions, such as a shortage of water or a requirement for structural repairs, water may be evacuated from this space.',
                    },
                    {
                        id: 'dead-cap',
                        label: 'Dead Capacity',
                        content:
                            'The reservoir capacity from which stored water cannot be evacuated by gravity.',
                    },
                ],
            },
        ],
    },
];

type QA = {
    id: string;
    question: ReactNode;
    answer: ReactNode;
    bullets?: ReactNode[];
};

export const questions: QA[] = [
    {
        id: 'wheres-the-data',
        question: 'Where does the data come from?',
        answer: (
            <Stack gap="var(--default-spacing)">
                <Text {...subSectionDescription}>
                    Reservoir storage data is primarily sourced from the&nbsp;
                    {getAnchor(
                        'Reclamation Information Sharing Environment (RISE)',
                        'https://data.usbr.gov/'
                    )}
                    &nbsp;system via the Western Water Data Hub. Data for US
                    Army Corps of Engineers reservoirs comes from&nbsp;
                    {getAnchor(
                        "USACE's Access2Water",
                        'https://water.usace.army.mil/'
                    )}
                    &nbsp;system via the Hub. In a few cases, reservoir storage
                    data comes from the&nbsp;
                    {getAnchor(
                        "US Geological Survey's Water Data for the Nation",
                        'https://waterdata.usgs.gov/'
                    )}
                    &nbsp;via the Hub or from the&nbsp;
                    {getAnchor(
                        'California Data Exchange Center (CDEC)',
                        'https://cdec.water.ca.gov/'
                    )}
                    &nbsp;via the Hub. Additional information on these data
                    sources is available from the Hub.
                </Text>
                <Text {...subSectionDescription}>
                    Reservoir storage data is generally obtained from the Hub as
                    either total or active reservoir storage in acre-feet for
                    the specified date, but in a few cases, the source data is
                    only provided as reservoir elevation, so the dashboard uses
                    elevation-storage curves to compute the reservoir storage
                    value that is displayed.
                </Text>
                <Text {...subSectionDescription}>
                    Reservoir capacity data is primarily sourced from
                    Reclamation's Enterprise Asset Registry. Capacities for
                    USACE reservoirs come from the Access2Water system.
                </Text>
                <Text {...subSectionDescription}>
                    Reference, base layers, and boundaries are sourced from the
                    data sources indicated in the dashboard via the Hub.
                </Text>
            </Stack>
        ),
    },
    {
        id: 'how-often',
        question: 'How often is the Dashboard updated?',
        answer: (
            <Stack gap="var(--default-spacing)">
                <Text {...subSectionDescription}>
                    The dashboard updates with the latest available data from
                    the source data systems every 6 hours.
                </Text>
                <Text {...subSectionDescription}>
                    Because the dashboard shows daily reservoir storage data,
                    the most recent possible storage values are for the previous
                    day. Reservoir storage data is updated in the source systems
                    (RISE, Access2Water, etc.) at varied intervals, depending on
                    facility and data system reporting schedules. Storage data
                    for the previous day is typically updated in source systems
                    each morning, but in some cases it may take several hours or
                    days for the values for a given date to be added to the
                    source system.
                </Text>
                <Text {...subSectionDescription}>
                    Selecting the “Latest Storage Value” option in the Dashboard
                    will show the most recent available value.
                </Text>
            </Stack>
        ),
    },
    {
        id: 'missing-reservoirs',
        question: 'Why do some reservoirs show missing data?',
        answer: (
            <Text {...subSectionDescription}>
                Reservoirs can show missing data for a couple of reasons:
            </Text>
        ),
        bullets: [
            <Text {...subSectionDescription}>
                <Text {...subSectionDescription} fw={700} component="strong">
                    Storage data for the reservoir is not yet available from the
                    Hub.
                </Text>
                &nbsp;In these cases, the reservoir will appear as a gray icon
                on the map, storage values on the teacup diagram will be listed
                as N/A, and there will be no time series available in the
                details view of the reservoir.
            </Text>,
            <Text {...subSectionDescription}>
                <Text {...subSectionDescription} fw={700} component="strong">
                    Storage data for the reservoir is not available for the
                    selected date.
                </Text>
                &nbsp;Data may be unavailable due to reporting delays, seasonal
                operations, or quality-control issues, all controlled by the
                data provider. In these cases, the reservoir will appear as a
                gray icon on the map and storage values on the teacup diagram
                will be listed as N/A, but there will be a time series of
                reservoir storage values available in the details view of the
                reservoir.
            </Text>,
        ],
    },
    {
        id: 'get-the-data',
        question: 'How can I get the data that I see in the dashboard?',
        answer: (
            <Stack gap="var(--default-spacing)">
                <Text {...subSectionDescription}>
                    You can access almost all the data in the dashboard from the
                    Western Water Data Hub.
                </Text>
                <Text {...subSectionDescription}>
                    The only data that is not available from the Hub is the
                    reservoir capacities, which are available…
                </Text>
            </Stack>
        ),
    },
    {
        id: 'get-reservoir-list',
        question: 'Is there a list of reservoirs and data sources?',
        answer: (
            <Text {...subSectionDescription}>
                The list of reservoirs and their associated ultimate data
                sources is available{' '}
                {getAnchor(
                    'here',
                    'https://api.wwdh.internetofwater.app/collections/teacup-edr/items?f=csv'
                )}
                .
            </Text>
        ),
    },
    {
        id: 'get-a-print',
        question:
            'Can I get a printable version of the dashboard or a version that I can put into a presentation?',
        answer: (
            <Stack gap="var(--default-spacing)">
                <Text {...subSectionDescription}>
                    To get an image of whatever you see on the map, use the
                    Screenshot tool. The map extents, reservoirs, reservoir
                    labels, reference data, the basemap, and boundaries will be
                    displayed as shown on the map when you take the screenshot.
                    The screenshot will not include detailed teacups, a title,
                    or a legend.
                </Text>
                <Text {...subSectionDescription}>
                    To get an image with a map, detailed teacups, a title, and a
                    legend, use the Report tool. With the report tool, you can
                    select specific reservoirs to include.
                </Text>
            </Stack>
        ),
    },
];

type Contact = {
    id: string;
    image?: ReactNode;
    body: ReactNode;
    link?: string;
};

export const contacts: Contact[] = [
    {
        id: 'github',
        image: <GitHub />,
        body: 'Access the repository containing the source code for the Western Water Datahub. Contribute new features, report issues, and learn more about how this application was built.',
        link: 'https://github.com/internetofwater/Western-Water-Datahub',
    },
    {
        id: 'email-bor',
        body: (
            <Text {...content}>
                For questions or feedback on the Western Water Data Dashboard,
                please contact the Bureau of Reclamation at{' '}
                <Text {...content} c="blue" span>
                    data@usbr.gov
                </Text>
                .
            </Text>
        ),
        link: 'mailto:data@usbr.gov',
    },
];
