import { Group, Switch } from '@mantine/core';
import styles from '@/features/TopBar/TopBar.module.css';

export const Filters: React.FC = () => {
    return (
        <Group className={styles.filterGroupContainer}>
            <Switch defaultChecked label="Show Teacups" />
            <Switch label="Show Streamflow Gages" />
            <Switch label="Show Weather" />
            <Switch label="Flag Low Storage" />
        </Group>
    );
};
