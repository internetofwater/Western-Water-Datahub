/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { CoverageCollection } from '@/services/edr.service';

/**
 *
 * @function
 */
export const getDateRange = (range: 1 | 5) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - range);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

/**
 *
 * @function
 */
export const getLabelsAndValues = (
    coverageCollection: CoverageCollection,
    parameter: string
): Array<{ x: string; y: number }> => {
    if (
        !(coverageCollection.coverages.length > 0) ||
        !coverageCollection.coverages[0].ranges ||
        !coverageCollection.coverages[0].ranges[parameter]
    ) {
        throw new Error(`Missing ${parameter} values for this location`);
    }

    const data: Array<{ x: string; y: number }> = [];

    const values = coverageCollection.coverages[0].ranges[parameter].values;
    const dates = coverageCollection.coverages[0].domain.axes.t.values;
    const length = values.length;
    for (let i = 0; i < length; i++) {
        const date = String(dates[i]);
        const value = values[i];
        data.push({
            x: date,
            y: value,
        });
    }
    // Ensure correct sorting to prevent fill render bug
    data.sort(
        (pointA, pointB) =>
            new Date(pointA.x).getTime() - new Date(pointB.x).getTime()
    );

    return data;
};

export const calculateInnerTrapezoidHeight = (
    size: number,
    base1: number,
    base2: number,
    height: number
): number => {
    if (base1 === base2) return height / 2;
    const sqrt2 = Math.SQRT2;
    const numerator =
        size *
        height *
        (2 * base1 - sqrt2 * Math.sqrt(base1 ** 2 + base2 ** 2));
    const denominator = base1 - base2;
    return numerator / denominator;
};

export const calculateXPositionConstructor =
    (pointA: [number, number], pointB: [number, number], offset: number) =>
    (y: number): number => {
        const x1 = pointA[0];
        const x2 = pointB[0];
        const y1 = pointA[1];
        const y2 = pointB[1];

        return y / ((y2 - y1) / (x2 - x1)) - offset;
    };

export const addLineConstructor =
    (
        width: number,
        svg: SVGElement,
        calculateXPosition: (value: number) => number
    ) =>
    (
        id: string,
        value: number,
        color: string,
        mouseEnterFunction: () => void,
        mouseLeaveFunction: () => void
    ): SVGPathElement => {
        const lineElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        lineElement.setAttribute('id', id);

        const lineStart = calculateXPosition(value);
        const lineEnd = width - lineStart;

        lineElement.setAttribute(
            'd',
            `M${lineStart} ${value} H${lineStart} ${lineEnd}`
        );
        lineElement.setAttribute('stroke-dasharray', '3,3');
        lineElement.setAttribute(
            'style',
            `fill:none;stroke:${color};stroke-width:3`
        );
        svg.appendChild(lineElement);

        lineElement.addEventListener('mouseenter', mouseEnterFunction);
        lineElement.addEventListener('mouseleave', mouseLeaveFunction);

        return lineElement;
    };

export const addTextConstructor =
    (width: number, svg: SVGElement) =>
    (
        id: string,
        text: string,
        position: number,
        color: string,
        display: boolean = true
        // mouseEnterFunction: () => void,
        // mouseLeaveFunction: () => void
    ): SVGTextElement => {
        const textElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
        );
        textElement.setAttribute('id', id);

        textElement.innerHTML = text;

        textElement.setAttribute('x', '50%');
        textElement.setAttribute('y', `${position}`);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('font-size', '7px');
        textElement.setAttribute('fill', color);
        textElement.setAttribute('display', display ? 'inline' : 'none');

        svg.appendChild(textElement);

        return textElement;
    };
