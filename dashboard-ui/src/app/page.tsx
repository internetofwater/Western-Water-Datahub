/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import styles from '@/app/page.module.css';
import Header from '@/features/Header';
import Loading from '@/features/Loading';
import Main from '@/features/Main';
import Notifications from '@/features/Notifications';

const Page: React.FC = () => {
    return (
        <>
            <div className={styles.page}>
                <header className={styles.header}>
                    <Header />
                </header>
                <main className={styles.main}>
                    <Main accessToken={process.env.MAPBOX_ACCESS_TOKEN ?? ''} />
                    <Notifications />
                </main>
                <Loading desktop />
                <footer className={styles.footer}></footer>
            </div>
        </>
    );
};

export default Page;
