/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

// Clockwise from top left
export const RESERVOIR_POSITIONS = [
    // Top
    { x: 80, y: 15 }, // A
    { x: 360, y: 15 }, // B
    { x: 640, y: 15 }, // C
    { x: 920, y: 15 }, // Top Right, D
    // Right most
    { x: 920, y: 240 }, // E
    // Bottom
    { x: 640, y: 685 }, // F
    { x: 360, y: 685 }, // G
    // left
    { x: 80, y: 685 }, // H
    { x: 80, y: 460 }, // I
    { x: 80, y: 240 }, // Top left, J
];

export const MAX_POSITIONS = RESERVOIR_POSITIONS.length;

export const TAGS = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
];

export const TAG_COLORS = [
    // USBR Brand Colors
    '#E7F6F8', // A
    '#FFBE2E', // B
    '#59B9DE', // C
    '#DEC69A', // D
    '#204E34', // E
    '#54278F', // F
    '#0081A1', // G
    '#EF5E25', // H
    // Other Colors
    '#A168A5', // I
    '#6FAA23', // J
    '#62737A',
    '#FAED4E',
    '#EE4BFA',
    '#9DFA57',
];
