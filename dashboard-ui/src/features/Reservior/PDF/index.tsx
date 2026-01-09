/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Loader, Stack, Box, Group } from '@mantine/core';
import { RefObject, useEffect, useRef, useState } from 'react';
import { useMap } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/consts';
import { Document } from '@/features/Reservior/PDF/Document';
import { PDFViewer } from '@react-pdf/renderer';
import styles from '@/features/Reservior/Reservoir.module.css';
import { Controls } from '@/features/Reservior/PDF/Controls';
import { Chart as ChartJS } from 'chart.js';
import {
    handleCreateChartImage,
    handleCreateDiagramImage,
    // handleCreateMapImage,
} from '@/features/Reservior/PDF/utils';
import useMainStore from '@/stores/main/main';
import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';

type Props = {
    accessToken: string;
    reservoirProperties: GeoJsonProperties;
    center: [number, number] | null;
    chartRef: RefObject<ChartJS<
        'line',
        Array<{ x: string; y: number }>
    > | null>;
    config: ReservoirConfig;
};

const PDF: React.FC<Props> = (props) => {
    const { reservoirProperties, center, chartRef, config } = props;

    const [mapImage, setMapImage] = useState<Blob | null>(null);
    const [chartImage, setChartImage] = useState<Blob | null>(null);
    const [diagramImage, setDiagramImage] = useState<Blob | null>(null);

    const graphicRef = useRef<SVGSVGElement>(null);

    const chartUpdate = useMainStore((state) => state.chartUpdate);

    const { map } = useMap(MAP_ID);

    useEffect(() => {
        if (!map || !center) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let cancel = false;
        setMapImage(null);

        // void handleCreateMapImage(
        //     map,
        //     center,
        //     accessToken,
        //     cancel,
        //     setMapImage
        // );

        return () => {
            cancel = true;
        };
    }, [map, center]);

    useEffect(() => {
        if (!chartRef.current) {
            return;
        }
        let cancel = false;
        setChartImage(null);

        if (chartRef.current) {
            void handleCreateChartImage(
                chartRef.current,
                cancel,
                setChartImage
            );
        }

        return () => {
            cancel = true;
        };
    }, [chartUpdate, reservoirProperties!._id]);

    useEffect(() => {
        let cancel = false;
        handleCreateDiagramImage(
            reservoirProperties,
            config,
            graphicRef,
            cancel,
            setDiagramImage
        );

        return () => {
            cancel = true;
        };
    }, [reservoirProperties!._id]);

    const [opened, { open, close }] = useDisclosure(false);

    if (!reservoirProperties) {
        return null;
    }

    const fileName = String(reservoirProperties.locationName)
        .toLowerCase()
        .split(' ')
        .join('-');

    return (
        <>
            <Modal opened={opened} onClose={close} title="Report" size="xl">
                {!mapImage || !chartImage || !diagramImage ? (
                    <Group
                        justify="center"
                        align="center"
                        className={styles.loaderGroup}
                    >
                        <Loader size="xl" />
                    </Group>
                ) : (
                    <Stack align="center" className={styles.PDFStack}>
                        <Box className={styles.PDFViewer}>
                            <PDFViewer showToolbar={false}>
                                <Document
                                    reservoirProperties={reservoirProperties}
                                    mapImage={mapImage}
                                    chartImage={chartImage}
                                    diagramImage={diagramImage}
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
                                    diagramImage={diagramImage}
                                />
                            }
                        />
                    </Stack>
                )}
            </Modal>

            <Button
                variant="default"
                onClick={open}
                disabled={!mapImage || !chartImage || !diagramImage}
                className={styles.PDFButton}
            >
                Download Report
            </Button>
        </>
    );
};

export default PDF;
