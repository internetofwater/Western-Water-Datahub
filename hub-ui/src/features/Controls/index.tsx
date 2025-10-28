import { Group } from '@mantine/core';
import styles from '@/features/Controls/Controls.module.css';
import Info from '@/features/Info';
import Download from '../Download';

const Controls: React.FC = () => {
  return (
    <Group justify="flex-start" align="center" grow={false} className={styles.controlsWrapper}>
      <Info />
      <Download />
    </Group>
  );
};

export default Controls;
