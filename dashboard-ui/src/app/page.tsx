import styles from '@/app/page.module.css';
import { Grid, GridCol, Paper, Text } from '@mantine/core';
import Map from '@/features/Map';
import TopBar from '@/features/TopBar';

const Page: React.FC = () => {
    return (
        <>
            <div className={styles.page}>
                <header className={styles.header}>
                    <TopBar />
                </header>
                <main className={styles.main}>
                    <Grid grow>
                        <GridCol span={12}>
                            {/* <AspectRatio ratio={16 / 5}> */}
                            <Map
                                accessToken={
                                    process.env.MAPBOX_ACCESS_TOKEN ?? ''
                                }
                            />
                            {/* </AspectRatio> */}
                        </GridCol>
                        <GridCol span={{ base: 12, md: 4 }}>
                            <Paper shadow="xs" p="xl">
                                <Text>Reservoir Info</Text>
                            </Paper>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 4 }}>
                            <Paper shadow="xs" p="xl">
                                <Text>Chart</Text>
                            </Paper>
                        </GridCol>
                        <GridCol span={{ base: 12, md: 4 }}>
                            <Paper shadow="xs" p="xl">
                                Average
                            </Paper>
                        </GridCol>
                    </Grid>
                </main>
                <footer className={styles.footer}></footer>
            </div>
        </>
    );
};

export default Page;
