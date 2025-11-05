import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Paper,
    Stack,
    Title,
} from '@mantine/core';
import { Header } from '@/features/Panel/Header';
import styles from '@/features/Panel/Panel.module.css';
import Reservoirs from '../Reservoirs';

const items = [
    {
        title: 'Reservoirs',
        content: <Reservoirs />,
    },
    {
        title: 'Legend',
        content: <></>,
    },
    {
        title: 'Controls',
        content: <></>,
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
                classNames={{ root: styles.root, content: styles.content }}
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
