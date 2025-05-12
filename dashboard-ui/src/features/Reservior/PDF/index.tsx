/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Loader, Stack, Box } from '@mantine/core';
import { RefObject, useEffect, useState } from 'react';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/consts';
import { Document } from '@/features/Reservior/PDF/Document';
import { PDFViewer } from '@react-pdf/renderer';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Controls } from '@/features/Reservior/PDF/Controls';
import { Chart as ChartJS } from 'chart.js';
import {
    handleCreateChartImage,
    handleCreateMapImage,
} from '@/features/Reservior/PDF/utils';
import { ReservoirProperties } from '@/features/Map/types';
import useMainStore from '@/lib/main';

type Props = {
    accessToken: string;
    reservoirProperties: ReservoirProperties;
    center: [number, number] | null;
    chartRef: RefObject<ChartJS<
        'line',
        Array<{ x: string; y: number }>
    > | null>;
};

const PDF: React.FC<Props> = (props) => {
    const { accessToken, reservoirProperties, center, chartRef } = props;

    const [mapImage, setMapImage] = useState<Blob | null>(null);
    const [chartImage, setChartImage] = useState<Blob | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const chartUpdate = useMainStore((state) => state.chartUpdate);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        if (!map || !center) {
            return;
        }
        let cancel = false;
        setLoading(true);
        setMapImage(null);

        void handleCreateMapImage(
            map,
            center,
            accessToken,
            cancel,
            setMapImage,
            setLoading
        );

        return () => {
            cancel = true;
        };
    }, [map, center]);

    useEffect(() => {
        if (!chartRef.current) {
            return;
        }
        let cancel = false;
        setLoading(true);
        setChartImage(null);

        if (chartRef.current) {
            void handleCreateChartImage(
                chartRef.current,
                cancel,
                setChartImage,
                setLoading
            );
        }

        return () => {
            cancel = true;
        };
    }, [chartUpdate, reservoirProperties._id]);

    const [opened, { open, close }] = useDisclosure(false);

    const fileName = reservoirProperties.locationName
        .toLowerCase()
        .split(' ')
        .join('-');

    return (
        <>
            <Modal opened={opened} onClose={close} title="Report" size="xl">
                {loading || !mapImage || !chartImage ? (
                    <Loader />
                ) : (
                    <Stack align="center" className={styles.PDFStack}>
                        <Box className={styles.PDFViewer}>
                            <PDFViewer showToolbar={false}>
                                <Document
                                    reservoirProperties={reservoirProperties}
                                    mapImage={mapImage}
                                    chartImage={chartImage}
                                />
                            </PDFViewer>
                        </Box>
                        <Controls
                            fileName={fileName}
                            pdf={
                                <Document
                                    reservoirProperties={reservoirProperties}
                                    mapImage={mapImage}
                                    chartImage={chartImage}
                                />
                            }
                        />
                    </Stack>
                )}
            </Modal>

            <Button
                variant="default"
                onClick={open}
                disabled={loading || !mapImage || !chartImage}
            >
                Download Report
            </Button>
        </>
    );
};

export default PDF;
