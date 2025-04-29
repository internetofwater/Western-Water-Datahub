import Close from '@/icons/Close';
import useMainStore from '@/lib/main';
import { ActionIcon } from '@mantine/core';
import styles from '@/features/Header/Selectors/Selectors.module.css';

/**

 * @component
 */
export const ClearAll: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const setRegion = useMainStore((state) => state.setRegion);
    const reservoir = useMainStore((state) => state.reservoir);
    const setReservoir = useMainStore((state) => state.setReservoir);

    const noSelections = region === 'all' && reservoir === 'all';

    const handleClick = () => {
        setRegion('all');
        setReservoir('all');
    };

    return (
        <ActionIcon
            variant="filled"
            aria-label="Clear all"
            title="Clear All"
            color="rgba(0, 119, 154, 1)"
            className={styles.clearAllButton}
            disabled={noSelections}
            onClick={handleClick}
        >
            <Close />
        </ActionIcon>
    );
};
