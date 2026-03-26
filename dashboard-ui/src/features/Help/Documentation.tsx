/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Stack, Title, Text, List, ListItem } from '@mantine/core';
import {
    content,
    sectionDescription,
    sectionLabel,
    sections,
    subSectionDescription,
    subSectionLabel,
} from './consts';

export const Documentation: React.FC = () => {
    return (
        <Stack
            gap="calc(var(--default-spacing) * 2)"
            mt="calc(var(--default-spacing) * 2)"
        >
            {sections.map((section) => (
                <Stack key={section.id} gap="calc(var(--default-spacing) / 1)">
                    {section.label &&
                        (typeof section.label === 'string' ? (
                            <Title {...sectionLabel}>{section.label}</Title>
                        ) : (
                            section.label
                        ))}
                    {section.description &&
                        (typeof section.description === 'string' ? (
                            <Text {...sectionDescription}>
                                {section.description}
                            </Text>
                        ) : (
                            section.description
                        ))}
                    {section.subSections.map((subSection) => (
                        <Stack
                            key={`${section.id}_${subSection.id}`}
                            gap="calc(var(--default-spacing) / 2)"
                        >
                            {subSection.label &&
                                (typeof subSection.label === 'string' ? (
                                    <Title {...subSectionLabel}>
                                        {subSection.label}
                                    </Title>
                                ) : (
                                    subSection.label
                                ))}
                            {subSection.description &&
                                (typeof subSection.description === 'string' ? (
                                    <Text {...subSectionDescription}>
                                        {subSection.description}
                                    </Text>
                                ) : (
                                    subSection.description
                                ))}
                            {subSection.entries.map((entry) => (
                                <List
                                    key={`${section.id}_${subSection.id}_${entry.id}`}
                                >
                                    <ListItem lh={1.1}>
                                        {entry.label && (
                                            <>
                                                {typeof entry.label ===
                                                'string' ? (
                                                    <Text {...content} fw={700}>
                                                        {entry.label}:
                                                    </Text>
                                                ) : (
                                                    entry.label
                                                )}
                                                &nbsp;
                                            </>
                                        )}

                                        {typeof entry.content === 'string' ? (
                                            <Text {...content}>
                                                {entry.content}
                                            </Text>
                                        ) : (
                                            entry.content
                                        )}
                                    </ListItem>
                                </List>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            ))}
        </Stack>
    );
};
