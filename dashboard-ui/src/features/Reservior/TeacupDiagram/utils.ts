/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { TspanData } from './types';

/**
 *
 * @function
 */
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

/**
 *
 * @function
 */
export const calculateXPositionConstructor =
    (pointA: [number, number], pointB: [number, number], offset: number) =>
    (y: number): number => {
        const x1 = pointA[0];
        const x2 = pointB[0];
        const y1 = pointA[1];
        const y2 = pointB[1];

        return y / ((y2 - y1) / (x2 - x1)) - offset;
    };

/**
 *
 * @function
 */
export const addLineConstructor =
    (
        width: number,
        svg: SVGElement,
        calculateXPosition: (value: number) => number
    ) =>
    (id: string, value: number, color: string): SVGPathElement => {
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
        const ghostLine = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        ghostLine.setAttribute('id', id + '-ghost');
        ghostLine.setAttribute(
            'd',
            `M${lineStart} ${value} H${lineStart} ${lineEnd}`
        );
        ghostLine.setAttribute(
            'style',
            `stroke:#FFF;stroke-width:10;opacity:0;`
        );

        svg.appendChild(lineElement);
        svg.appendChild(ghostLine);

        return lineElement;
    };

const appendTspans = (textElement: SVGTextElement, tspanData: TspanData[]) => {
    for (const data of tspanData) {
        const tspan = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'tspan'
        );

        if (data.dx) tspan.setAttribute('dx', data.dx);
        if (data.dy) tspan.setAttribute('dy', data.dy);
        if (data['font-size'])
            tspan.setAttribute('font-size', data['font-size']);
        if (data['font-weight'])
            tspan.setAttribute('font-weight', data['font-weight']);

        if (typeof data.content === 'string') {
            tspan.textContent = data.content;
        } else if (Array.isArray(data.content)) {
            appendTspans(tspan as SVGTextElement, data.content);
        }

        textElement.appendChild(tspan);
    }
};

/**
 *
 * @function
 */
export const addTextConstructor =
    (svg: SVGElement) =>
    (
        id: string,
        text: string,
        position: number,
        color: string,
        display: boolean = true
    ): SVGTextElement => {
        const textElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
        );
        textElement.setAttribute('id', id);

        // TODO: replace this if rendering issues appear
        textElement.innerHTML = text;

        textElement.setAttribute('x', '35%'); // (160 / 2) / 230 = ~0.35
        textElement.setAttribute('y', `${position}`);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('font-size', '7px');
        textElement.setAttribute('font-weight', 'bold');
        textElement.setAttribute('fill', color);
        textElement.setAttribute('display', display ? 'inline' : 'none');

        svg.appendChild(textElement);

        return textElement;
    };

/**
 *
 * @function
 */
export const addLabelConstructor =
    (
        width: number,
        svg: SVGElement,
        calculateXPosition: (value: number) => number
    ) =>
    (
        id: string,
        text: TspanData[],
        value: number,
        color: string,
        display: boolean = true,
        bold: boolean = false
    ): SVGTextElement => {
        const textElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
        );
        textElement.setAttribute('id', id);

        appendTspans(textElement, text);

        const lineStart = calculateXPosition(value);
        const lineEnd = width - lineStart;

        textElement.setAttribute('x', `${lineEnd + 18}`);
        textElement.setAttribute('y', `${value}`);
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('font-size', '9px');
        if (bold) {
            textElement.setAttribute('font-weight', 'bold');
        }
        textElement.setAttribute('fill', color);
        textElement.setAttribute('display', display ? 'inline' : 'none');

        svg.appendChild(textElement);

        return textElement;
    };

/**
 *
 * @function
 */
export const propagateEventToContainerElemConstructor =
    (capacityPolygonId: string, storagePolygonId: string, cutHeight: number) =>
    (which: 'mouseenter' | 'mouseleave', value: number) => {
        const hoverEvent = new Event(which, { bubbles: true });
        if (value < cutHeight) {
            const capacityElement = document.getElementById(capacityPolygonId);
            if (capacityElement) {
                capacityElement.dispatchEvent(hoverEvent);
            }
        } else if (value > cutHeight) {
            const storageElement = document.getElementById(storagePolygonId);
            if (storageElement) {
                storageElement.dispatchEvent(hoverEvent);
            }
        } else {
            const storageElement = document.getElementById(storagePolygonId);
            if (storageElement) {
                storageElement.dispatchEvent(hoverEvent);
            }
            const capacityElement = document.getElementById(capacityPolygonId);
            if (capacityElement) {
                capacityElement.dispatchEvent(hoverEvent);
            }
        }
    };

/**
 *
 * @function
 */
export const addListeners = (
    id: string,
    handlers: { mouseenter?: () => void; mouseleave?: () => void }
) => {
    const element = document.getElementById(id);
    if (!element) return;

    if (handlers.mouseenter) {
        element.addEventListener('mouseenter', handlers.mouseenter);
    }
    if (handlers.mouseleave) {
        element.addEventListener('mouseleave', handlers.mouseleave);
    }

    return () => {
        if (handlers.mouseenter) {
            element.removeEventListener('mouseenter', handlers.mouseenter);
        }
        if (handlers.mouseleave) {
            element.removeEventListener('mouseleave', handlers.mouseleave);
        }
    };
};
