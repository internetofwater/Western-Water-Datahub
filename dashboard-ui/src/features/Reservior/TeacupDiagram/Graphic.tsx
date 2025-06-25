/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { MantineColorScheme } from '@mantine/core';
import { RefObject, useEffect, useRef, useState } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    storagePolygonId,
    storageTextId,
    capacityPolygonId,
    capacityTextId,
    averageTextId,
    capacityFill,
    storageFill,
    highPercentileId,
    highPercentileLabelId,
    averageId,
    averageLabelId,
    lowPercentileId,
    lowPercentileLabelId,
} from '@/features/Reservior/TeacupDiagram/consts';
import {
    calculateInnerTrapezoidHeight,
    calculateXPositionConstructor,
    addLineConstructor,
    addLabelConstructor,
    addTextConstructor,
    propagateEventToContainerElemConstructor,
    addListeners,
} from '@/features/Reservior/TeacupDiagram/utils';
import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';
import {
    handleAverageLineEnter,
    handleAverageLineLeave,
    handleCapacityEnter,
    handleCapacityLeave,
    handleStorageEnter,
    handleStorageLeave,
} from '@/features/Reservior/TeacupDiagram/listeners';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
    showLabels: boolean;
    listeners: boolean;
    colorScheme: MantineColorScheme;
    svgRenderCallback?: () => void;
    graphicRef?: RefObject<SVGSVGElement | null>;
};

export const Graphic: React.FC<Props> = (props) => {
    const {
        graphicRef,
        reservoirProperties,
        config,
        showLabels,
        colorScheme,
        listeners,
        svgRenderCallback: callback,
    } = props;

    const _graphicRef = graphicRef ?? useRef<SVGSVGElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [cutHeight, setCutHeight] = useState<number>();
    const [highPercentile, setHighPercentile] = useState<number>();
    const [average, setAverage] = useState<number>();
    const [lowPercentile, setLowPercentile] = useState<number>();

    useEffect(() => {
        if (!svgRef.current || !reservoirProperties || !config) {
            return;
        }

        svgRef.current.innerHTML = '';

        // TODO: remove the division by 2 once we have an actual storage value
        const percentOfFull =
            Number(reservoirProperties[config.storageProperty]) /
            2 /
            Number(reservoirProperties[config.capacityProperty]);

        // Determine basic dimensions of teacup trapezoid
        const size = 1 - Number(percentOfFull.toFixed(2));
        const upperWidth = 160;
        const lowerWidth = 64;
        const height = 107;
        const scale = 1;

        // TODO: replace these with the actual percentages
        const highPercentile = height - height * 0.95;
        const average = height - height * 0.81;
        const lowPercentile = height - height * 0.4;

        setHighPercentile(highPercentile);
        setAverage(average);
        setLowPercentile(lowPercentile);

        const textColor = colorScheme === 'light' ? '#000' : '#FFF';

        // Calculate the height of the sub-trapezoid representing storage
        const cutHeight = calculateInnerTrapezoidHeight(
            size,
            upperWidth,
            lowerWidth,
            height
        );
        setCutHeight(cutHeight);

        // Calculate points defining the primary (capacity) trapezoid
        const upperLeft: [number, number] = [0, 0];
        const upperRight: [number, number] = [upperWidth * scale, 0];
        const lowerRight: [number, number] = [
            ((upperWidth + lowerWidth) / 2) * scale,
            height * scale,
        ];
        const lowerLeft: [number, number] = [
            ((upperWidth - lowerWidth) / 2) * scale,
            height * scale,
        ];

        // Calculate the points of the inner (storage) trapezoid
        const baseCut =
            upperWidth + (lowerWidth - upperWidth) * (cutHeight / height);
        const innerUpperLeft: [number, number] = [
            ((upperWidth - baseCut) / 2) * scale,
            cutHeight * scale,
        ];
        const innerUpperRight: [number, number] = [
            ((upperWidth + baseCut) / 2) * scale,
            cutHeight * scale,
        ];

        // Draw Full trapezoid
        const capacity = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'polygon'
        );
        capacity.setAttribute('id', capacityPolygonId);
        capacity.setAttribute('stroke', '#00b8f0');
        capacity.setAttribute('stroke-width', '0');
        capacity.setAttribute('fill', capacityFill);
        capacity.setAttribute('filter', 'url(#shadow)');
        capacity.setAttribute(
            'points',
            `${upperLeft.join(',')} ${upperRight.join(',')} ${lowerRight.join(
                ','
            )} ${lowerLeft.join(',')}`
        );
        svgRef.current.appendChild(capacity);

        // Draw inner trapezoid
        const storage = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'polygon'
        );
        storage.setAttribute('id', storagePolygonId);
        storage.setAttribute('stroke', '#00b8f0');
        storage.setAttribute('stroke-width', '0');
        storage.setAttribute('fill', storageFill);
        // storage.setAttribute('class', 'grow');
        storage.setAttribute(
            'points',
            `${innerUpperLeft.join(',')} ${innerUpperRight.join(
                ','
            )} ${lowerRight.join(',')} ${lowerLeft.join(',')}`
        );
        svgRef.current.appendChild(storage);

        // Define constructors for helper functions and repeated elements
        const calculateXPosition = calculateXPositionConstructor(
            upperLeft,
            lowerLeft,
            0
        );

        const addLine = addLineConstructor(
            upperWidth,
            svgRef.current,
            calculateXPosition
        );

        const addLabel = addLabelConstructor(
            upperWidth,
            svgRef.current,
            calculateXPosition
        );

        const addText = addTextConstructor(svgRef.current);

        // Add high percentile line and label
        addLine(highPercentileId, highPercentile, '#FFF');

        const highLabelText = renderToStaticMarkup(
            <>
                <tspan dx="10" dy="0" fontWeight="bold" fontSize="9">
                    High
                </tspan>
                <tspan dx="-35" dy="9" fontSize="8">
                    (90
                    <tspan dy="-5" fontSize="4">
                        th
                    </tspan>
                    &nbsp;
                    <tspan dy="5" fontSize="8">
                        Percentile)
                    </tspan>
                </tspan>
            </>
        );

        const highLabel = addLabel(
            highPercentileLabelId,
            highLabelText,
            highPercentile,
            textColor
        );

        // Add average line and label

        // Adjust the average label position if too close to high percentile label
        let averageAdjust = 0;
        if (average - highPercentile < 40) {
            const height = highLabel.getBBox().height;

            averageAdjust = Math.max(
                0,
                height - (average - highPercentile + 1)
            );
        }

        addLine(averageId, average, '#d0a02a');

        const averageLabelText = renderToStaticMarkup(
            <>
                <tspan dx="2" dy={averageAdjust}>
                    30-year
                </tspan>
                <tspan dx="-35" dy="8">
                    Average
                </tspan>
            </>
        );

        const averageLabel = addLabel(
            averageLabelId,
            averageLabelText,
            average,
            '#d0a02a'
        );

        // Add low percentile line and label

        addLine(lowPercentileId, lowPercentile, '#FFF');

        // Adjust the low percentile label position if too close to average label
        // Handle if average is also too close to high percentile
        let lowPercentileAdjust = 0;
        if (lowPercentile - average < 40) {
            const height = averageLabel.getBBox().height;

            lowPercentileAdjust =
                Math.max(0, height - (lowPercentile - average + 1)) +
                averageAdjust;
        }

        const lowLabelText = renderToStaticMarkup(
            <>
                <tspan
                    dx="10"
                    dy={lowPercentileAdjust}
                    fontWeight="bold"
                    fontSize="9"
                >
                    Low
                </tspan>
                <tspan dx="-35" dy="8" fontSize="8">
                    (90
                    <tspan dy="-5" fontSize="4">
                        th
                    </tspan>
                    &nbsp;
                    <tspan dy="5" fontSize="8">
                        Percentile)
                    </tspan>
                </tspan>
            </>
        );

        addLabel(lowPercentileLabelId, lowLabelText, lowPercentile, textColor);

        // Total capacity of reservoir
        addText(
            capacityTextId,
            `${Number(
                reservoirProperties[config.capacityProperty]
            ).toLocaleString('en-us')} acre-feet`,
            -1,
            textColor,
            showLabels
        );
        // TODO: replace the two displayed values below, when available
        // Renders just above the average line
        addText(
            averageTextId,
            `${Math.round(
                (Number(reservoirProperties[config.storageProperty]) / 2) * 1.3
            ).toLocaleString('en-us')} acre-feet`,
            average - 2,
            '#d0a02a',
            showLabels
        );
        // Current Storage of reservoir
        addText(
            storageTextId,
            `${(
                Number(reservoirProperties[config.storageProperty]) / 2
            ).toLocaleString('en-us')} acre-feet`,
            cutHeight - 1,
            '#FFF',
            showLabels
        );

        // Now that the diagram is created, call the callback function if exists
        // Used when creating the diagram for the report
        callback?.();
    }, [svgRef, colorScheme]);

    useEffect(() => {
        if (
            !listeners ||
            !cutHeight ||
            !highPercentile ||
            !average ||
            !lowPercentile
        )
            return;

        const propagateEventToContainerElem =
            propagateEventToContainerElemConstructor(
                capacityPolygonId,
                storagePolygonId,
                cutHeight
            );

        const cleanups: (() => void)[] = [];

        cleanups.push(
            addListeners(capacityPolygonId, {
                mouseenter: handleCapacityEnter,
                mouseleave: () => handleCapacityLeave(showLabels),
            })!
        );

        cleanups.push(
            addListeners(storagePolygonId, {
                mouseenter: handleStorageEnter,
                mouseleave: () => handleStorageLeave(showLabels),
            })!
        );

        const highPercentileHandler =
            (type: 'mouseenter' | 'mouseleave') => () =>
                propagateEventToContainerElem(type, highPercentile);

        cleanups.push(
            addListeners(highPercentileId, {
                mouseenter: highPercentileHandler('mouseenter'),
                mouseleave: highPercentileHandler('mouseleave'),
            })!
        );

        cleanups.push(
            addListeners(`${highPercentileId}-ghost`, {
                mouseenter: highPercentileHandler('mouseenter'),
                mouseleave: highPercentileHandler('mouseleave'),
            })!
        );

        const averageHandler = (type: 'mouseenter' | 'mouseleave') => () => {
            if (type === 'mouseenter') handleAverageLineEnter();
            else handleAverageLineLeave(showLabels);

            propagateEventToContainerElem(type, average);
        };

        cleanups.push(
            addListeners(averageId, {
                mouseenter: averageHandler('mouseenter'),
                mouseleave: averageHandler('mouseleave'),
            })!
        );

        cleanups.push(
            addListeners(`${averageId}-ghost`, {
                mouseenter: averageHandler('mouseenter'),
                mouseleave: averageHandler('mouseleave'),
            })!
        );

        cleanups.push(
            addListeners(averageTextId, {
                mouseenter: averageHandler('mouseenter'),
                mouseleave: averageHandler('mouseleave'),
            })!
        );

        const lowPercentileHandler =
            (type: 'mouseenter' | 'mouseleave') => () =>
                propagateEventToContainerElem(type, lowPercentile);

        cleanups.push(
            addListeners(lowPercentileId, {
                mouseenter: lowPercentileHandler('mouseenter'),
                mouseleave: lowPercentileHandler('mouseleave'),
            })!
        );

        cleanups.push(
            addListeners(`${lowPercentileId}-ghost`, {
                mouseenter: lowPercentileHandler('mouseenter'),
                mouseleave: lowPercentileHandler('mouseleave'),
            })!
        );

        return () => {
            cleanups.forEach((cleanup) => cleanup?.());
        };
    }, [
        listeners,
        colorScheme,
        showLabels,
        cutHeight,
        highPercentile,
        average,
        lowPercentile,
    ]);

    return (
        <svg
            data-testid="graphic-svg"
            viewBox="-5 -10 220 127"
            className={styles.svg}
            ref={_graphicRef}
        >
            <defs>
                <filter id="shadow">
                    <feDropShadow dx="0.5" dy="0.4" stdDeviation="0.4" />
                </filter>
            </defs>
            <g ref={svgRef}></g>
        </svg>
    );
};
