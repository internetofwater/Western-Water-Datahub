/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { ReservoirConfig } from '@/features/Map/types';
import { TeacupDiagram } from '@/features/Reservior/TeacupDiagram';

const mockProps = {
    reservoirProperties: {
        storage: 5000,
        capacity: 10000,
    },
    config: {
        storageProperty: 'storage',
        capacityProperty: 'capacity',
    } as ReservoirConfig,
    showLabels: true,
};

describe('Graphic component', () => {
    test('renders title and switch', () => {
        render(<TeacupDiagram {...mockProps} />);
        expect(screen.getByText(/Current Storage Levels/i)).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('renders SVG container', () => {
        render(<TeacupDiagram {...mockProps} />);
        const svg = screen.getByTestId('graphic-svg');
        expect(svg).toBeInTheDocument();
    });

    test('toggles label visibility with switch', async () => {
        render(<TeacupDiagram {...mockProps} />);
        const toggle = screen.getByRole('switch');
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
    });

    test('renders capacity and storage legend items', () => {
        render(<TeacupDiagram {...mockProps} />);
        expect(screen.getByTestId('graphic-legend')).toBeInTheDocument();
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
});
