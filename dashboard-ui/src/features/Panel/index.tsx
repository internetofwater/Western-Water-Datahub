/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Group,
    Paper,
    Title,
} from '@mantine/core';
import { Header } from '@/features/Panel/Header';
import styles from '@/features/Panel/Panel.module.css';
import Reservoirs from '@/features/Reservoirs';
import Controls from '@/features/Controls';
import DarkModeToggle from '@/features/Header/DarkModeToggle';
import Help from '@/features/Help';

const items = [
    {
        title: 'Reservoirs',
        content: <Reservoirs />,
    },
    {
        title: 'Controls',
        content: <Controls />,
    },
];

const Panel: React.FC = () => {
    return (
        <Paper className={styles.panel}>
            <Header />
            <Accordion
                multiple
                className={styles.sticky}
                classNames={{
                    root: styles.root,
                    content: styles.content,
                    control: styles.control,
                }}
            >
                {items.map(({ title, content }) => (
                    <AccordionItem key={title} value={title}>
                        <AccordionControl>
                            <Title order={2} size="h4">
                                {title}
                            </Title>
                        </AccordionControl>
                        <AccordionPanel>{content}</AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
            <Group justify="space-between" p="calc(var(--default-spacing) * 2)">
                <Group gap="var(--default-spacing)">
                    <Help />
                </Group>
                <DarkModeToggle />
            </Group>
        </Paper>
    );
};

export default Panel;
