/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import styles from '@/app/page.module.css';
import Main from '@/features/Main';
import Notifications from '@/features/Notifications';
import { Box } from '@mantine/core';

const Page: React.FC = () => {
    return (
        <>
            <Box component="main" className={styles.main}>
                <Main accessToken={process.env.MAPBOX_ACCESS_TOKEN ?? ''} />
                <Notifications />
            </Box>
            <Box component="footer" className={styles.footer}></Box>
        </>
    );
};

export default Page;
