import { TextInput } from '@mantine/core';
import debounce from 'lodash.debounce';
import { useEffect } from 'react';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

type Props = {
    search: string;
    handleChange: (value: string) => void;
};

export const Search: React.FC<Props> = (props) => {
    const { search, handleChange } = props;

    const debouncedHandleChange = debounce(handleChange, 150);

    useEffect(() => {
        return () => {
            debouncedHandleChange.cancel();
        };
    }, []);

    return (
        <TextInput
            size="xs"
            className={styles.searchInput}
            label={'Reservoir'}
            placeholder="Search by name"
            value={search}
            onChange={(event) =>
                debouncedHandleChange(event.currentTarget.value)
            }
        />
    );
};
