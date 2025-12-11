/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment } from 'react';
import { Divider, List, Stack, Text } from '@mantine/core';
import { questions } from '@/features/Help/consts';
import styles from '@/features/Help/Help.module.css';

export const FAQ: React.FC = () => {
    return (
        <Stack
            my="calc(var(--default-spacing) * 2)"
            mx="var(--default-spacing)"
            gap="calc(var(--default-spacing) * 2)"
        >
            {questions.map((question, index) => (
                <Fragment key={`faq-${question.id}`}>
                    {index > 0 && <Divider />}
                    <Stack gap="calc(var(--default-spacing) / 2)">
                        <Text fw={700}>{question.question}</Text>
                        <Text className={styles.faqAnswer}>
                            {question.answer}
                        </Text>
                        {question.bullets && question.bullets.length && (
                            <List className={styles.faqBullets}>
                                {question.bullets.map((bullet, index) => (
                                    <List.Item
                                        key={`faq-${question.id}-bullet-${index}`}
                                    >
                                        <Text size="sm">
                                            {bullet.label && (
                                                <strong>
                                                    {bullet.label}&nbsp;
                                                </strong>
                                            )}
                                            {bullet.content}
                                        </Text>
                                    </List.Item>
                                ))}
                            </List>
                        )}
                    </Stack>
                </Fragment>
            ))}
        </Stack>
    );
};
