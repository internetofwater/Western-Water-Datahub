/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    addLabelConstructor,
    addLineConstructor,
    addTextConstructor,
    calculateInnerTrapezoidHeight,
    calculateXPositionConstructor,
    propagateEventToContainerElemConstructor,
} from '@/features/Reservior/Graphic/utils';

describe('Reservoir Graphic Utils', () => {
    describe('calculateInnerTrapezoidHeight', () => {
        test('returns half the height when bases are equal', () => {
            expect(calculateInnerTrapezoidHeight(0.5, 100, 100, 200)).toBe(100);
        });

        test('calculates correct height when bases differ', () => {
            const result = calculateInnerTrapezoidHeight(0.5, 160, 64, 107);
            expect(result).toBeCloseTo(42.5, 1);
        });
    });

    describe('calculateXPositionConstructor', () => {
        test('returns correct x position for a given y', () => {
            const calcX = calculateXPositionConstructor([0, 0], [100, 100], 0);
            expect(calcX(50)).toBe(50);
        });

        test('handles vertical slope correctly', () => {
            const calcX = calculateXPositionConstructor([0, 10], [0, 20], 0);
            const x = calcX(0);
            expect(x).toBe(0);
        });
    });

    describe('addLineConstructor', () => {
        test('creates line and ghost line elements', () => {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            const calcX = () => 10;
            const addLine = addLineConstructor(160, svg, calcX);
            const line = addLine('test-line', 50, '#000');

            expect(line.tagName).toBe('path');
            expect(svg.querySelector('#test-line')).toBeTruthy();
            expect(svg.querySelector('#test-line-ghost')).toBeTruthy();
        });
    });

    describe('addTextConstructor', () => {
        test('creates a text element with correct attributes', () => {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            const addText = addTextConstructor(svg);
            const text = addText('test-text', 'Hello', 50, '#000', true);

            expect(text.tagName).toBe('text');
            expect(text.getAttribute('display')).toBe('inline');
            expect(svg.querySelector('#test-text')).toBeTruthy();
        });
    });

    describe('addLabelConstructor', () => {
        test('creates a label text element with correct attributes', () => {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            const calcX = () => 10;
            const addLabel = addLabelConstructor(160, svg, calcX);
            const label = addLabel('label-id', 'Label', 40, '#000');

            expect(label.tagName).toBe('text');
            expect(label.getAttribute('x')).toBe(`${160 - 10 + 18}`);
        });
    });

    describe('propagateEventToContainerElemConstructor', () => {
        test('dispatches event to correct element based on value', () => {
            const capacity = document.createElement('div');
            capacity.id = 'capacity';
            const storage = document.createElement('div');
            storage.id = 'storage';
            document.body.appendChild(capacity);
            document.body.appendChild(storage);

            const spyCapacity = jest.fn();
            const spyStorage = jest.fn();
            capacity.addEventListener('mouseenter', spyCapacity);
            storage.addEventListener('mouseenter', spyStorage);

            const propagate = propagateEventToContainerElemConstructor(
                'capacity',
                'storage',
                50
            );

            propagate('mouseenter', 30); // should trigger capacity
            propagate('mouseenter', 70); // should trigger storage
            propagate('mouseenter', 50); // should trigger both

            expect(spyCapacity).toHaveBeenCalledTimes(2);
            expect(spyStorage).toHaveBeenCalledTimes(2);
        });
    });
});
