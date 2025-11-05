import { TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import styles from '@/features/Reservoirs/Reservoirs.module.css';

type Props = {
    search: string;
    handleChange: (value: string) => void;
};

export const Search: React.FC<Props> = (props) => {
    const { search, handleChange } = props;

    const [localSearch, setLocalSearch] = useState(search);

    useEffect(() => {
        const timeout = setTimeout(() => {
            handleChange(localSearch);
        }, 150);

        return () => {
            clearTimeout(timeout);
        };
    }, [localSearch]);

    return (
        <TextInput
            size="xs"
            className={styles.searchInput}
            label={'Reservoir'}
            placeholder="Search by name"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.currentTarget.value)}
        />
    );
};
