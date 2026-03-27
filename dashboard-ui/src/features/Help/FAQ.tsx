/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment } from 'react';
import { Divider, List, Stack, Text, Title } from '@mantine/core';
import {
    questions,
    sectionDescription,
    sectionLabel,
} from '@/features/Help/consts';
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
                        {typeof question.question === 'object' ? (
                            question.question
                        ) : (
                            <Title {...sectionLabel}>{question.question}</Title>
                        )}
                        {typeof question.answer === 'object' ? (
                            question.answer
                        ) : (
                            <Text {...sectionDescription}>
                                {question.answer}
                            </Text>
                        )}

                        {question.bullets && question.bullets.length && (
                            <List className={styles.faqBullets}>
                                {question.bullets.map((bullet, index) => (
                                    <List.Item
                                        lh={1.25}
                                        key={`faq-${question.id}-bullet-${index}`}
                                    >
                                        {bullet}
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
