import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Loader, Stack, Box } from '@mantine/core';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useMap } from '@/contexts/MapContexts';
import { Map } from 'mapbox-gl';
import { MAP_ID } from '../Map/config';
import { Document } from '@/features/PDF/Document';
import { PDFViewer } from '@react-pdf/renderer';
import styles from '@/features/PDF/PDF.module.css';
import { Controls } from './Controls';

export const PDF: React.FC = () => {
    const [mapImage, setMapImage] = useState<Blob | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { map } = useMap(MAP_ID);

    const createScreenshot = (map: Map): Promise<Blob | null> => {
        return new Promise(function (resolve) {
            map.once('render', function () {
                map.getCanvas().toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    }
                });
            });
            /* trigger render */
            map.setBearing(map.getBearing());
        });
    };

    const handleScreenshot = async (
        map: Map,
        cancel: boolean,
        setMapImage: Dispatch<SetStateAction<Blob | null>>,
        setLoading: Dispatch<SetStateAction<boolean>>
    ) => {
        const data = await createScreenshot(map);
        if (!cancel) {
            setMapImage(data);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!map) {
            return;
        }
        let cancel = false; // Initial screenshot

        void handleScreenshot(map, cancel, setMapImage, setLoading);

        const onIdle = () => {
            void handleScreenshot(map, cancel, setMapImage, setLoading);
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

    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Modal opened={opened} onClose={close} title="Report" size="xl">
                {loading || !mapImage ? (
                    <Loader />
                ) : (
                    <Stack align="center" className={styles.PDFStack}>
                        <Box className={styles.PDFViewer}>
                            <PDFViewer showToolbar={false}>
                                <Document mapImage={mapImage} />
                            </PDFViewer>
                        </Box>
                        <Controls
                            fileName="test"
                            pdf={<Document mapImage={mapImage} />}
                        />
                    </Stack>
                )}
            </Modal>

            <Button variant="default" onClick={open} disabled={loading}>
                Download Report
            </Button>
        </>
    );
};
