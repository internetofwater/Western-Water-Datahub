import { glossaryEntries, GlossaryEntry } from './consts';

export const getGlossaryEntry = (
    glossaryEntry: string
): GlossaryEntry | undefined => {
    return glossaryEntries.find((entry) => entry.id === glossaryEntry);
};
