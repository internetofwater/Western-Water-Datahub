import { Group } from '@mantine/core';
import styles from '@/features/Panel/Controls/Controls.module.css';
import { ClearAllData } from './ClearAllData';
import { SearchLocations } from './SearchLocations';

const Controls: React.FC = () => {
  return (
    <Group className={styles.controlsWrapper} grow>
      <SearchLocations />
      <ClearAllData />
    </Group>
  );
};

export default Controls;
