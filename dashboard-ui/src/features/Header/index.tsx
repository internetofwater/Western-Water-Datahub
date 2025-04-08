'use client';

import { Box, Button, Collapse, Group, Paper, Select } from '@mantine/core';
import styles from '@/features/Header/Header.module.css';
import { useDisclosure } from '@mantine/hooks';
import { Filters } from '@/features/Header/Filters';
import useMainStore from '@/lib/main';
import { Region } from './Selectors/Region';
import { Reservoir } from './Selectors/Reservoir';

const Header: React.FC = () => {
    const [opened, { toggle }] = useDisclosure(false);

    const basin = useMainStore((state) => state.basin);
    const setBasin = useMainStore((state) => state.setBasin);

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
                            <Region />
                            <Select
                                id="basinSelector"
                                searchable
                                data={[{ value: 'all', label: 'All Basins' }]}
                                value={basin}
                                placeholder="Select a region"
                                onChange={(_value) =>
                                    setBasin(_value as string)
                                }
                            />
                            <Reservoir />
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

export default Header;
