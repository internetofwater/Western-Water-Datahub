import styles from '@/app/page.module.css';
import { Box, Grid, GridCol, Paper, Text } from '@mantine/core';
import Map from '@/features/Map';

const Page: React.FC = () => {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <Grid grow>
                    <GridCol
                        span={{ base: 12, md: 3 }}
                        order={{ base: 2, md: 1 }}
                    >
                        <Box component="div">Left Panel</Box>
                    </GridCol>
                    <GridCol
                        span={{ base: 12, md: 9 }}
                        order={{ base: 1, md: 2 }}
                    >
                        <Grid grow>
                                <GridCol span={12}>
                                    <Box
                                        component="div"
                                        className={styles.mapContainer}
                                    >
                                        <Map
                                            accessToken={
                                                process.env
                                                    .MAPBOX_ACCESS_TOKEN ?? ''
                                            }
                                        />
                                    </Box>
                                </GridCol>
                                <GridCol span={{ base: 12, md: 6 }}>
                                    <Paper shadow="xs" p="xl">
                                        <Text>Chart</Text>
                                    </Paper>
                                </GridCol>
                                <GridCol span={{ base: 12, md: 6 }}>
                                    <Paper shadow="xs" p="xl">
                                        Average
                                    </Paper>
                                </GridCol>
                        </Grid>
                    </GridCol>
                </Grid>
            </main>
            <footer className={styles.footer}></footer>
        </div>
    );
};

export default Page;
