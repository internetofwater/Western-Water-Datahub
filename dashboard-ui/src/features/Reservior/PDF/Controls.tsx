/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReactElement, useEffect, useRef, useState } from 'react';
import { usePDF, DocumentProps } from '@react-pdf/renderer';
import { Button, Group } from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';

type Props = {
    fileName: string;
    pdf: ReactElement<DocumentProps, string>;
};

export const Controls: React.FC<Props> = (props) => {
    const { fileName, pdf } = props;

    const [instance] = usePDF({ document: pdf });
    const [url, setUrl] = useState<string>();
    const frameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (instance.blob) {
            setUrl(
                URL.createObjectURL(
                    new Blob([instance.blob], {
                        type: instance.blob.type,
                    })
                )
            );
        }
    }, [instance]);

    const downloadPDF = () => {
        if (instance.url) {
            const link = document.createElement('a');
            link.href = instance.url;
            link.download = fileName + '.pdf';
            link.click();
        }
    };

    const printPDF = () => {
        if (frameRef.current && frameRef.current.contentWindow) {
            frameRef.current.contentWindow.print();
        }
    };

    return (
        <>
            <Group>
                <Button
                    variant="default"
                    disabled={instance.loading}
                    onClick={downloadPDF}
                    className={styles.controlButton}
                >
                    Download
                </Button>
                <Button
                    variant="default"
                    disabled={!url || instance.loading}
                    onClick={printPDF}
                    className={styles.controlButton}
                >
                    Print
                </Button>
            </Group>
            {url && (
                <iframe ref={frameRef} src={url} style={{ display: 'none' }} />
            )}
        </>
    );
};
