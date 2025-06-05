/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React, { memo } from 'react';
import {
    Page,
    Document as PDFDocument,
    StyleSheet,
    Image,
    View,
    Text,
} from '@react-pdf/renderer';
import { GeoJsonProperties } from 'geojson';

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#E4E4E4',
    },
    titleSection: {
        padding: 10,
    },
    section: {
        margin: 10,
        padding: 10,
    },
});

type Props = {
    reservoirProperties: GeoJsonProperties;
    mapImage: Blob;
    chartImage: Blob;
    diagramImage: Blob;
};

export const Document: React.FC<Props> = memo((props) => {
    const { reservoirProperties, mapImage, chartImage, diagramImage } = props;

    if (!reservoirProperties) {
        return null;
    }

    const title = String(reservoirProperties.locationName)
        .toLowerCase()
        .replace(/ /g, '_');

    return (
        <PDFDocument title={title}>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>{reservoirProperties.locationName}</Text>
                </View>
                <View style={styles.section}>
                    <Image src={mapImage} />
                    <Image src={chartImage} />
                    <Image src={diagramImage} />
                </View>
            </Page>
        </PDFDocument>
    );
});
