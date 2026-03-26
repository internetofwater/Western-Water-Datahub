/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title, Text, List, Divider } from '@mantine/core';
import {
    content,
    sectionDescription,
    sectionLabel,
    sections,
    subSectionDescription,
    subSectionLabel,
} from '@/features/Help/consts';
import { Fragment } from 'react';

export const Documentation: React.FC = () => {
    return (
        <Stack
            gap="calc(var(--default-spacing) * 2)"
            mt="calc(var(--default-spacing) * 2)"
        >
            {sections.map((section, index) => (
                <Fragment>
                    {index > 0 && <Divider />}
                    <Stack
                        key={section.id}
                        gap="calc(var(--default-spacing) / 1)"
                    >
                        {section.label &&
                            (typeof section.label === 'object' ? (
                                section.label
                            ) : (
                                <Title {...sectionLabel}>{section.label}</Title>
                            ))}
                        {section.description &&
                            (typeof section.description === 'object' ? (
                                section.description
                            ) : (
                                <Text {...sectionDescription}>
                                    {section.description}
                                </Text>
                            ))}
                        {section.subSections.map((subSection) => (
                            <Stack
                                key={`${section.id}_${subSection.id}`}
                                gap="calc(var(--default-spacing) / 2)"
                            >
                                {subSection.label &&
                                    (typeof subSection.label === 'object' ? (
                                        subSection.label
                                    ) : (
                                        <Title {...subSectionLabel}>
                                            {subSection.label}
                                        </Title>
                                    ))}
                                {subSection.description &&
                                    (typeof subSection.description ===
                                    'object' ? (
                                        subSection.description
                                    ) : (
                                        <Text {...subSectionDescription}>
                                            {subSection.description}
                                        </Text>
                                    ))}
                                {subSection.entries.map((entry) => (
                                    <List
                                        key={`${section.id}_${subSection.id}_${entry.id}`}
                                        size="lg"
                                    >
                                        <List.Item lh={1.25}>
                                            {entry.label && (
                                                <>
                                                    {typeof entry.label ===
                                                    'object' ? (
                                                        entry.label
                                                    ) : (
                                                        <Text
                                                            {...content}
                                                            fw={700}
                                                        >
                                                            {entry.label}:
                                                        </Text>
                                                    )}
                                                    &nbsp;
                                                </>
                                            )}

                                            {typeof entry.content ===
                                            'object' ? (
                                                entry.content
                                            ) : (
                                                <Text {...content}>
                                                    {entry.content}
                                                </Text>
                                            )}
                                        </List.Item>
                                    </List>
                                ))}
                            </Stack>
                        ))}
                    </Stack>
                </Fragment>
            ))}
        </Stack>
    );
};
