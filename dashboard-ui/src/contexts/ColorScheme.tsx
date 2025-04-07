import { createContext, Dispatch, SetStateAction } from 'react';

export default createContext<{
    colorScheme: string;
    onChange: Dispatch<SetStateAction<string>>;
} | null>(null);
