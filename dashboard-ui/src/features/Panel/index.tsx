/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Paper,
    Title,
} from '@mantine/core';
import { Header } from '@/features/Panel/Header';
import styles from '@/features/Panel/Panel.module.css';
import Reservoirs from '@/features/Reservoirs';
import Legend from '@/features/Legend';
import Controls from '@/features/Controls';

const items = [
    {
        title: 'Reservoirs',
        content: <Reservoirs />,
    },
    {
        title: 'Legend',
        content: <Legend />,
    },
    {
        title: 'Controls',
        content: <Controls />,
    },
    {
        title: 'Report',
        content: <></>,
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
        </Paper>
    );
};

export default Panel;
