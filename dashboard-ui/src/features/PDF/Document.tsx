import React from 'react';
import {
    Page,
    Document as PDFDocument,
    StyleSheet,
    Image,
    View,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
});

type Props = {
    mapImage: Blob;
};

export const Document: React.FC<Props> = (props) => {
    const { mapImage } = props;

    return (
        <PDFDocument title="test">
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Image src={mapImage} />
                </View>
            </Page>
        </PDFDocument>
    );
};
