/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import {
    ActionIcon,
    Box,
    Button,
    CloseButton,
    Group,
    Loader,
    Popover,
    PopoverDropdown,
    PopoverTarget,
    Stack,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { Map } from 'mapbox-gl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import ScreenshotIcon from '@/icons/Screenshot';
import { NotificationType, Overlay } from '@/stores/session/types';
import useSessionStore from '@/stores/session';
import { useMediaQuery } from '@mantine/hooks';
import { toJpeg } from 'html-to-image';
import notificationManager from '@/managers/Notification.init';

/**
 *
 * @component
 */
const Screenshot: React.FC = () => {
    const [src, setSrc] = useState<string>('');
    const [name, setName] = useState<string>('WWDH-Map');
    const [loading, setLoading] = useState<boolean>(false);

    const overlay = useSessionStore((state) => state.overlay);
    const setOverlay = useSessionStore((state) => state.setOverlay);

    const mobile = useMediaQuery('(max-width: 899px)');

    const [show, setShow] = useState(false);

    const { map } = useMap(MAP_ID);

    const createScreenshot = (map: Map): Promise<string> => {
        return new Promise(function (resolve) {
            map.once('render', function () {
                resolve(map.getCanvas().toDataURL());
            });
            /* trigger render */
            map.setBearing(map.getBearing());
        });
    };

    const handleScreenshot = async (
        map: Map,
        cancel: boolean,
        setSrc: Dispatch<SetStateAction<string>>,
        setLoading: Dispatch<SetStateAction<boolean>>
    ) => {
        const data = await createScreenshot(map);
        if (!cancel) {
            setSrc(data);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!map) {
            return;
        }
        let cancel = false; // Initial screenshot

        void handleScreenshot(map, cancel, setSrc, setLoading);

        const onIdle = () => {
            void handleScreenshot(map, cancel, setSrc, setLoading);
        };

        const onMove = () => {
            if (!cancel) {
                setLoading(true);
            }
            map.once('idle', onIdle);
        };

        map.on('dragend', onMove);
        map.on('zoomend', onMove);

        return () => {
            cancel = true;
            map.off('dragend', onMove);
            map.off('zoomend', onMove);
        };
    }, [map]);

    useEffect(() => {
        if (overlay !== Overlay.Screenshot) {
            setShow(false);
        }
    }, [overlay]);

    const downloadDataUrl = (dataUrl: string, filename: string) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const downloadImage = async () => {
        try {
            downloadDataUrl(src, `${name}.jpg`);

            const legend = document.getElementById('legend');
            if (!legend) return;

            // ensure it's rendered
            await new Promise(requestAnimationFrame);

            const dataUrl = await toJpeg(legend, {
                style: { display: 'block' },
            });
            downloadDataUrl(dataUrl, `${name}-legend.jpg`);
        } catch (err) {
            notificationManager.show(
                (err as Error).message,
                NotificationType.Error,
                10000
            );
        }
    };

    const handleShow = (show: boolean) => {
        setOverlay(show ? Overlay.Screenshot : null);
        setShow(show);
    };

    return (
        <Popover
            opened={show}
            onChange={setShow}
            closeOnClickOutside={false}
            position="left-start"
            shadow="md"
            zIndex={99999}
        >
            <PopoverTarget>
                <Tooltip label="Show screenshot tool" disabled={show}>
                    <ActionIcon
                        classNames={{
                            root: styles.actionIconRoot,
                            icon: styles.actionIcon,
                        }}
                        onClick={() => handleShow(!show)}
                        size={mobile ? 'lg' : 'md'}
                    >
                        <ScreenshotIcon />
                    </ActionIcon>
                </Tooltip>
            </PopoverTarget>
            <PopoverDropdown>
                <Group
                    justify="space-between"
                    mb="calc(var(--default-spacing) / 2)"
                >
                    <Title order={3} className={styles.mapToolTitle}>
                        Screenshot
                    </Title>
                    <CloseButton
                        mr="-0.5rem"
                        onClick={() => setOverlay(null)}
                        aria-label="Close Screenshot"
                    />
                </Group>
                {src.length > 0 ? (
                    <Stack>
                        {loading ? (
                            <Box className={styles.screenshotLoaderContainer}>
                                <Loader color="#0183a1" type="dots" />
                            </Box>
                        ) : (
                            <Image
                                src={src}
                                alt="Preview of Map Screenshot"
                                width={200}
                                height={100}
                            />
                        )}
                        <TextInput
                            label="File Name"
                            value={name}
                            onChange={(event) =>
                                setName(event.currentTarget.value)
                            }
                        />
                        <Button
                            variant="default"
                            onClick={() => void downloadImage()}
                            disabled={loading}
                        >
                            Download
                        </Button>
                    </Stack>
                ) : (
                    <Loader color="#0183a1" type="dots" />
                )}
            </PopoverDropdown>
        </Popover>
    );
};

export default Screenshot;
