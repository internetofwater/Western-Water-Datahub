import styles from '@/app/page.module.css';
import Header from '@/features/Header';
import Main from '@/features/Main';

const Page: React.FC = () => {
    return (
        <>
            <div className={styles.page}>
                <header className={styles.header}>
                    <Header />
                </header>
                <main className={styles.main}>
                    <Main accessToken={process.env.MAPBOX_ACCESS_TOKEN ?? ''} />
                </main>
                <footer className={styles.footer}></footer>
            </div>
        </>
    );
};

export default Page;
