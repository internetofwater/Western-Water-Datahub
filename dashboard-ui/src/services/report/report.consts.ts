/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

// Counter clockwise from legend
// export const RESERVOIR_POSITIONS = [
//     // Right most
//     { x: 1400, y: 300 },
//     // Top
//     { x: 1400, y: 90 }, // Top Right
//     { x: 1150, y: 20 },
//     { x: 900, y: 20 },
//     { x: 650, y: 20 },
//     { x: 400, y: 20 },
//     { x: 150, y: 20 },
//     // left
//     { x: 60, y: 250 }, // Top left
//     { x: 60, y: 500 },

//     // Bottom
//     { x: 300, y: 675 },
//     { x: 550, y: 675 },
//     { x: 800, y: 675 },
//     { x: 1050, y: 675 },
// ];

// Clockwise from top left (old positions)
// export const RESERVOIR_POSITIONS = [
//     // Top
//     { x: 150, y: 20 },
//     { x: 400, y: 20 },
//     { x: 650, y: 20 },
//     { x: 900, y: 20 },
//     { x: 1150, y: 20 },
//     { x: 1400, y: 90 }, // Top Right
//     // Right most
//     { x: 1400, y: 300 },
//     // Bottom
//     { x: 1050, y: 675 },
//     { x: 800, y: 675 },
//     { x: 550, y: 675 },
//     { x: 300, y: 675 },
//     // left
//     { x: 60, y: 675 },
//     { x: 60, y: 460 },
//     { x: 60, y: 240 }, // Top left
// ];

const OFFSET_X = 50;
const OFFSET_Y = 25;

const WIDTH_X = 1650 / 6; // 6 across 1650px map canvas width
const WIDTH_Y = 1275 / 5; // 5 across 1275px map canvas height

export const RESERVOIR_POSITIONS = [
    // Top
    { x: OFFSET_X + 0 * WIDTH_X, y: OFFSET_Y },
    { x: OFFSET_X + 1 * WIDTH_X, y: OFFSET_Y },
    { x: OFFSET_X + 2 * WIDTH_X, y: OFFSET_Y },
    { x: OFFSET_X + 3 * WIDTH_X, y: OFFSET_Y },
    { x: OFFSET_X + 4 * WIDTH_X, y: OFFSET_Y },
    { x: OFFSET_X + 5 * WIDTH_X, y: OFFSET_Y },

    // Right
    { x: OFFSET_X + 5 * WIDTH_X, y: OFFSET_Y + 1 * WIDTH_Y },

    // Left
    { x: OFFSET_X, y: OFFSET_Y + 1 * WIDTH_Y },
    { x: OFFSET_X, y: OFFSET_Y + 2 * WIDTH_Y },
    { x: OFFSET_X, y: OFFSET_Y + 3 * WIDTH_Y },
    { x: OFFSET_X, y: OFFSET_Y + 4 * WIDTH_Y },

    // Bottom
    { x: OFFSET_X + 1 * WIDTH_X, y: OFFSET_Y + 4 * WIDTH_Y },
    { x: OFFSET_X + 2 * WIDTH_X, y: OFFSET_Y + 4 * WIDTH_Y },
    { x: OFFSET_X + 3 * WIDTH_X, y: OFFSET_Y + 4 * WIDTH_Y },
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
    '#9DFA57',
    '#EE4BFA',
    '#FAAB4B',
    '#A168A5',
    '#4BC2FA',
    '#087F2F',
    '#62737A',
    '#3966D5',
    '#6FAA23',
    '#FF570E',
    '#CFF9E0',
    '#997B60',
    '#7328A4',
    '#FAED4E',
];
