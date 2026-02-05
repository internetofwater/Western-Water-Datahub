/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    ActionIcon,
    Group,
    Paper,
    Title,
} from '@mantine/core';
import { Header } from '@/features/Panel/Header';
import styles from '@/features/Panel/Panel.module.css';
import Reservoirs from '@/features/Reservoirs';
import Controls from '@/features/Controls';
import DarkModeToggle from '@/features/Panel/DarkModeToggle';
import Help, { HELP_LOCAL_KEY } from '@/features/Help';
import { useEffect, useMemo, useRef, useState } from 'react';
import X from '@/icons/X';
import { useMediaQuery } from '@mantine/hooks';
import useSessionStore from '@/stores/session';
import { Overlay } from '@/stores/session/types';
import { Report } from './Report';

type Props = {
    accessToken: string;
};

const Panel: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const overlay = useSessionStore((state) => state.overlay);
    const setOverlay = useSessionStore((state) => state.setOverlay);

    const [show, setShow] = useState(true);

    const mobile = useMediaQuery('(max-width: 899px)');

    const firstClose = useRef(true);

    useEffect(() => {
        if (!mobile) {
            setShow(true);
            return;
        }

        setShow(overlay === Overlay.Controls);
    }, [mobile, overlay]);

    const items = useMemo(() => {
        const items = [
            {
                title: 'Reservoirs',
                content: <Reservoirs />,
            },
            {
                title: 'Reference Data',
                content: <Controls />,
            },
        ];

        if (accessToken) {
            items.push({
                title: 'Report',
                content: <Report accessToken={accessToken} />,
            });
        }

        return items;
    }, [accessToken]);

    const handleClick = () => {
        const stored = localStorage.getItem(HELP_LOCAL_KEY);
        const shouldShow = stored === null || stored === 'true';

        if (firstClose.current && mobile && shouldShow) {
            setOverlay(Overlay.Legend);
        } else {
            setOverlay(null);
        }

        firstClose.current = false;
    };

    return (
        <Paper
            className={styles.panel}
            style={{ display: show ? 'block' : 'none' }}
        >
            <Header />
            <ActionIcon
                size="sm"
                variant="transparent"
                onClick={handleClick}
                classNames={{
                    root: styles.actionIconRoot,
                    icon: styles.actionIcon,
                }}
                className={styles.mobileClose}
            >
                <X />
            </ActionIcon>
            <Accordion
                multiple
                defaultValue={['Reservoirs']}
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
