'use client';

import { Box, Button, Collapse, Group, Paper, Select } from '@mantine/core';
import styles from '@/features/TopBar/TopBar.module.css';
import { useDisclosure } from '@mantine/hooks';
import { Filters } from '@/features/TopBar/Filters';
import useMainStore from '@/lib/main';

const TopBar: React.FC = () => {
    const [opened, { toggle }] = useDisclosure(false);

    const region = useMainStore((state) => state.region);
    const basin = useMainStore((state) => state.basin);
    const reservoir = useMainStore((state) => state.reservoir);

    return (
        <>
            <Box component="div" className={styles.topBarContainer}>
                <Paper
                    radius={0}
                    shadow="xs"
                    className={styles.topBarPaper}
                    style={{ height: '50px' }}
                >
                    {/* <Image
                        src={}
                        alt="Description of image"
                        width={500}
                        height={300}
                    /> */}
                </Paper>
            </Box>
            <Box component="div" className={styles.topBarContainer}>
                <Paper radius={0} shadow="xs" className={styles.topBarPaper}>
                    <Group justify="space-between">
                        <Group gap="xl">
                            <Select
                                id="regionSelector"
                                searchable
                                data={[
                                    { value: 'all', label: 'All Regions' },
                                    {
                                        value: 'Upper Colorado',
                                        label: 'Upper Colorado',
                                    },
                                    {
                                        value: 'Lower Colorado',
                                        label: 'Lower Colorado',
                                    },
                                    {
                                        value: 'Mid-Pacific',
                                        label: 'Mid-Pacific',
                                    },
                                    {
                                        value: 'Pacific Northwest',
                                        label: 'Pacific Northwest',
                                    },
                                    {
                                        value: 'Great Plains',
                                        label: 'Great Plains',
                                    },
                                ]}
                                value={region}
                                placeholder="Select a region"
                            />
                            <Select
                                id="basinSelector"
                                searchable
                                data={[{ value: 'all', label: 'All Basins' }]}
                                value={basin}
                                placeholder="Select a region"
                            />
                            <Select
                                id="reservoirSelector"
                                searchable
                                data={[{ value: 'all', label: 'All Basins' }]}
                                value={reservoir}
                                placeholder="Select a Reservior"
                            />
                        </Group>
                        <Button variant="default" onClick={toggle}>
                            Show Filters
                        </Button>
                    </Group>
                    <Collapse in={opened}>
                        <Filters />
                    </Collapse>
                </Paper>
            </Box>
        </>
    );
};

export default TopBar;
