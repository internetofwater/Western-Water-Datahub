/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { ReservoirConfig } from '@/features/Map/types';
import { Graphic } from '@/features/Reservior/Graphic';

const mockProps = {
    reservoirProperties: {
        storage: 5000,
        capacity: 10000,
    },
    config: {
        storageProperty: 'storage',
        capacityProperty: 'capacity',
    } as ReservoirConfig,
};

describe('Graphic component', () => {
    test('renders title and switch', () => {
        render(<Graphic {...mockProps} />);
        expect(screen.getByText(/Storage Volume/i)).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    test('renders SVG container', () => {
        render(<Graphic {...mockProps} />);
        const svg = screen.getByTestId('graphic-svg');
        expect(svg).toBeInTheDocument();
    });

    test('toggles label visibility with switch', async () => {
        render(<Graphic {...mockProps} />);
        const toggle = screen.getByRole('switch');
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
    });

    test('renders capacity and storage legend items', () => {
        render(<Graphic {...mockProps} />);
        expect(screen.getByTestId('graphic-legend')).toBeInTheDocument();
    });

    test('adds SVG elements on mount', async () => {
        render(<Graphic {...mockProps} />);
        await waitFor(() => {
            const polygon = document.querySelector('polygon');
            const text = document.querySelector('text');
            expect(polygon).toBeInTheDocument();
            expect(text).toBeInTheDocument();
        });
    });
});
