/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

export const joinSentence = (parts: string[], conjunction: string): string => {
    if (parts.length === 0) {
        return '';
    }
    if (parts.length === 1) {
        return `${parts[0]}.`;
    }
    if (parts.length === 2) {
        return `${parts[0]}, ${conjunction} ${parts[1]}.`;
    }
    return `${parts.slice(0, -1).join(', ')}, ${conjunction} ${parts[parts.length - 1]}.`;
};
