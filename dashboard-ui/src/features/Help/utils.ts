/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { glossaryEntries, GlossaryEntry } from './consts';

export const getGlossaryEntry = (
    glossaryEntry: string
): GlossaryEntry | undefined => {
    return glossaryEntries.find((entry) => entry.id === glossaryEntry);
};
