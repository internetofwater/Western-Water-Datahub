/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import 'mapbox-gl';
import { TextEncoder } from 'util';

global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

global.TextEncoder = TextEncoder;

window.MessageChannel = jest.fn().mockImplementation(() => {
    let _onmessage: ((event: MessageEvent) => void) | null = null;

    return {
        port1: {
            set onmessage(cb: (event: MessageEvent) => void) {
                _onmessage = cb;
            },
            postMessage: jest.fn(),
            start: jest.fn(),
            close: jest.fn(),
        },
        port2: {
            postMessage: jest.fn(),
            start: jest.fn(),
            close: jest.fn(),
        },
    };
});
