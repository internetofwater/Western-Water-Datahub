/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
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
};

export const Document: React.FC<Props> = (props) => {
    const { reservoirProperties, mapImage, chartImage } = props;

    if (!reservoirProperties) {
        return null;
    }

    return (
        <PDFDocument title="test">
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>{reservoirProperties.locationName}</Text>
                </View>
                <View style={styles.section}>
                    <Image src={mapImage} />
                    <Image src={chartImage} />
                </View>
            </Page>
        </PDFDocument>
    );
};
