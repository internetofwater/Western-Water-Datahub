/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import dayjs from 'dayjs';

export const displayDate = (date: string) => {
    if (dayjs(date).isValid()) {
        return dayjs(date).format('MM/DD/YYYY');
    }

    return 'No data';
};

export const displayVolume = (volume: number) => {
    if (!isFinite(volume)) {
        return 'N/A';
    }

    if (isNaN(volume)) {
        return 'N/A';
    }

    return volume.toLocaleString('en-US');
};

export const displayVolumeWithUnits = (volume: number) => {
    if (!isFinite(volume)) {
        return 'N/A';
    }

    const value = displayVolume(volume);

    if (value === 'N/A') {
        return value;
    }

    return `${value} acre-feet`;
};

export const displayPercentage = (percentage: number) => {
    if (!isFinite(percentage)) {
        return 'N/A';
    }

    if (isNaN(percentage)) {
        return 'N/A';
    }

    return `${percentage.toFixed(1)}%`;
};
