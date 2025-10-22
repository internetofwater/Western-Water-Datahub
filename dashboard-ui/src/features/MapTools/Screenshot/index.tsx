/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

'use client';

import {
    Box,
    Button,
    Card,
    CardSection,
    CloseButton,
    Group,
    Loader,
    Stack,
    TextInput,
    Title,
} from '@mantine/core';
import styles from '@/features/MapTools/MapTools.module.css';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { Map } from 'mapbox-gl';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import useMainStore from '@/stores/main/main';
import { Tools } from '@/stores/main/types';

/**
 *
 * @component
 */
const Screenshot: React.FC = () => {
    const [src, setSrc] = useState<string>('');
    const [name, setName] = useState<string>('WWDH-Map');
    const [loading, setLoading] = useState<boolean>(false);

    const setOpenTools = useMainStore((state) => state.setOpenTools);

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

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = name + '.jpg';
        link.click();
    };

    return (
        <Card withBorder shadow="sm" radius="md" padding="md">
            <CardSection withBorder inheritPadding py="xs">
                <Group justify="space-between">
                    <Title order={3} className={styles.mapToolTitle}>
                        Screenshot
                    </Title>
                    <CloseButton
                        onClick={() => setOpenTools(Tools.Print, false)}
                        aria-label="Close Screenshot"
                    />
                </Group>
            </CardSection>
            <CardSection inheritPadding py="md" className={styles.toolContent}>
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
                            onClick={downloadImage}
                            disabled={loading}
                        >
                            Download
                        </Button>
                    </Stack>
                ) : (
                    <Loader color="#0183a1" type="dots" />
                )}
            </CardSection>
        </Card>
    );
};

export default Screenshot;
