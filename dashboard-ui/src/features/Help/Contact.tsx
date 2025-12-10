/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Grid, Group, Paper, Text } from '@mantine/core';
import { contacts } from '@/features/Help/consts';
import styles from '@/features/Help/Help.module.css';

export const Contact: React.FC = () => {
    return (
        <Grid
            mt="calc(var(--default-spacing) * 2)"
            gutter="var(--default-spacing)"
        >
            {contacts.map((contact) => (
                <Grid.Col key={`contact-${contact.id}`} span={6}>
                    <Paper
                        component="a"
                        href={contact.link}
                        className={styles.contactWrapper}
                        target="_blank"
                        shadow="xl"
                        p="calc(var(--default-spacing) / 2)"
                    >
                        <Box className={styles.contact}>
                            <Group
                                gap="var(--default-spacing)"
                                align="flex-start"
                                grow
                            >
                                <Box className={styles.contactImage}>
                                    {contact.image}
                                </Box>
                                <Text size="sm" className={styles.contactBody}>
                                    {contact.body}
                                </Text>
                            </Group>
                            <Text
                                size="xs"
                                ta="center"
                                title={contact.link}
                                lineClamp={1}
                                className={styles.contactLink}
                            >
                                {contact.link}
                            </Text>
                        </Box>
                    </Paper>
                </Grid.Col>
            ))}
        </Grid>
    );
};
