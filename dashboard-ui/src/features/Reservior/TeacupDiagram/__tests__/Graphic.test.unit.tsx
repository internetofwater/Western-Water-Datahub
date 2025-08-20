/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { ReservoirConfig } from '@/features/Map/types';
import { TeacupDiagram } from '@/features/Reservior/TeacupDiagram';
import { getHeight, getY } from '@/features/Reservior/TeacupDiagram/utils';

const mockProps = {
    reservoirProperties: {
        storage: 5000,
        average: 7500,
        capacity: 10000,
    },
    config: {
        storageProperty: 'storage',
        thirtyYearAverageProperty: 'average',
        capacityProperty: 'capacity',
    } as ReservoirConfig,
    showLabels: true,
};

jest.mock('@/features/Reservior/TeacupDiagram/utils', () => {
    const actual = jest.requireActual(
        '@/features/Reservior/TeacupDiagram/utils'
    );
    return {
        ...actual,
        getHeight: jest.fn(() => 20),
        getY: jest.fn(() => 20),
    };
});

describe('Graphic component', () => {
    beforeAll(() => {
        (getHeight as jest.Mock).mockReturnValue(20);
        (getY as jest.Mock).mockReturnValue(20);
    });

    test('renders SVG container', () => {
        render(<TeacupDiagram {...mockProps} />);
        const svg = screen.getByTestId('graphic-svg');
        expect(svg).toBeInTheDocument();
    });

    test('adds SVG elements on mount', async () => {
        render(<TeacupDiagram {...mockProps} />);
        await waitFor(() => {
            const polygon = document.querySelector('polygon');
            const text = document.querySelector('text');
            expect(polygon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
        });
    });

    test('renders correct labels', () => {
        render(<TeacupDiagram {...mockProps} />);
        expect(screen.getByText(/10,000 acre-feet/i)).toBeInTheDocument();
        expect(screen.getByText(/7,500 acre-feet/i)).toBeInTheDocument();
        expect(screen.getByText(/5,000 acre-feet/i)).toBeInTheDocument();
    });
});
