/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Anchor, Box, Flex, Grid, Paper, Stack, Text } from '@mantine/core';
import { contacts } from '@/features/Help/consts';
import styles from '@/features/Help/Help.module.css';

export const Contact: React.FC = () => {
    return (
        <Grid mt="lg" gutter="lg">
            {contacts.map((contact) => (
                <Grid.Col
                    key={`contact-${contact.id}`}
                    span={contact.featured ? 12 : { base: 12, sm: 6 }}
                >
                    <Paper
                        className={styles.contactWrapper}
                        shadow="xs"
                        p="md"
                        h="100%"
                    >
                        <Flex
                            h="100%"
                            direction={
                                contact.featured
                                    ? { base: 'column', sm: 'row' }
                                    : 'column'
                            }
                            justify="space-between"
                            gap="md"
                        >
                            <Stack gap="md">
                                {contact.image && (
                                    <Box className={styles.contactImage}>
                                        {contact.image}
                                    </Box>
                                )}

                                <Text fw={700}>{contact.role}</Text>

                                {contact.body}
                            </Stack>

                            {contact.link && (
                                <Anchor
                                    className={styles.contactLink}
                                    href={contact.link.href}
                                    title={contact.link.text}
                                    size="sm"
                                    c="blue.8"
                                    lineClamp={1}
                                >
                                    {contact.link.text}
                                </Anchor>
                            )}
                        </Flex>
                    </Paper>
                </Grid.Col>
            ))}
        </Grid>
    );
};
