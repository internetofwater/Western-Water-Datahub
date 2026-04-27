/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, MantineColorScheme, Text } from '@mantine/core';
import { RefObject, useEffect, useRef, useState } from 'react';
import styles from '@/features/Reservior/Reservoir.module.css';
import {
    storagePolygonId as _storagePolygonId,
    storageTextId as _storageTextId,
    capacityPolygonId as _capacityPolygonId,
    capacityTextId as _capacityTextId,
    averageTextId as _averageTextId,
    highPercentileId as _highPercentileId,
    highPercentileLabelId as _highPercentileLabelId,
    averageId as _averageId,
    averageLabelId as _averageLabelId,
    lowPercentileId as _lowPercentileId,
    lowPercentileLabelId as _lowPercentileLabelId,
    capacityFill,
    storageFill,
    getAverageLabel,
    getHighPercentileLabel,
    getLowPercentileLabel,
} from '@/features/Reservior/TeacupDiagram/consts';
import {
    // calculateYPosition,
    calculateXPositionConstructor,
    addLineConstructor,
    addLabelConstructor,
    addTextConstructor,
    propagateEventToContainerElemConstructor,
    addListeners,
    getHeight,
    getY,
    calculateYPositionContructor,
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
    labels?: boolean;
    listeners: boolean;
    colorScheme: MantineColorScheme;
    svgRenderCallback?: () => void;
    graphicRef?: RefObject<SVGSVGElement | null>;
    className?: string;
};

export const Graphic: React.FC<Props> = (props) => {
    const {
        graphicRef,
        reservoirProperties,
        config,
        showLabels,
        labels = true,
        colorScheme,
        listeners,
        svgRenderCallback: callback,
        className = styles.svg,
    } = props;

    const _graphicRef = graphicRef ?? useRef<SVGSVGElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [capacityYPosition, setCapacityYPosition] = useState<number>();
    const [highPercentile, setHighPercentile] = useState<number>();
    const [average, setAverage] = useState<number>();
    const [lowPercentile, setLowPercentile] = useState<number>();
    const [isInvalidGraphic, setIsInvalidGraphic] = useState(false);

    useEffect(() => {
        if (!svgRef.current || !reservoirProperties || !config) {
            return;
        }

        let storagePolygonId = '',
            storageTextId = '',
            capacityPolygonId = '',
            capacityTextId = '',
            averageTextId = '',
            highPercentileId = '',
            highPercentileLabelId = '',
            averageId = '',
            averageLabelId = '',
            lowPercentileId = '',
            lowPercentileLabelId = '';
        if (listeners) {
            storagePolygonId = _storagePolygonId;
            storageTextId = _storageTextId;
            capacityPolygonId = _capacityPolygonId;
            capacityTextId = _capacityTextId;
            averageTextId = _averageTextId;
            highPercentileId = _highPercentileId;
            highPercentileLabelId = _highPercentileLabelId;
            averageId = _averageId;
            averageLabelId = _averageLabelId;
            lowPercentileId = _lowPercentileId;
            lowPercentileLabelId = _lowPercentileLabelId;
        }

        while (svgRef.current.firstChild) {
            svgRef.current.removeChild(svgRef.current.firstChild);
        }

        const storagePercentage = Math.min(
            Number(reservoirProperties[config.storageProperty]) /
                Number(reservoirProperties[config.capacityProperty]),
            1
        );
        const ninetiethPercentage =
            Number(reservoirProperties[config.ninetiethPercentileProperty]) /
            Number(reservoirProperties[config.capacityProperty]);
        const averagePercentage =
            Number(reservoirProperties[config.thirtyYearAverageProperty]) /
            Number(reservoirProperties[config.capacityProperty]);
        const tenthPercentage =
            Number(reservoirProperties[config.tenthPercentileProperty]) /
            Number(reservoirProperties[config.capacityProperty]);

        if (isNaN(storagePercentage)) {
            setIsInvalidGraphic(true);
            return;
        }

        const hasHighPercentile = !isNaN(ninetiethPercentage);
        const hasAverage = !isNaN(averagePercentage);
        const hasLowPercentile = !isNaN(tenthPercentage);

        // Determine basic dimensions of teacup trapezoid
        const size = 1 - Number(storagePercentage.toFixed(2));
        const upperWidth = 160;
        const lowerWidth = 64;
        const height = 107;
        const scale = 1;

        const highPercentile = 1 - Number(ninetiethPercentage.toFixed(2));
        const average = 1 - Number(averagePercentage.toFixed(2));
        const lowPercentile = 1 - Number(tenthPercentage.toFixed(2));

        console.log('Here', averagePercentage, average, height);

        if (hasHighPercentile && !isNaN(highPercentile)) {
            setHighPercentile(highPercentile);
        }
        if (hasAverage && !isNaN(average)) {
            setAverage(average);
        }
        if (hasLowPercentile && !isNaN(lowPercentile)) {
            setLowPercentile(lowPercentile);
        }
        setAverage(average);
        setLowPercentile(lowPercentile);

        const textColor = colorScheme === 'light' ? '#000' : '#FFF';

        const calculateYPosition = calculateYPositionContructor(
            upperWidth,
            lowerWidth,
            height
        );

        // Calculate the height of the sub-trapezoid representing storage
        const capacityYPosition = calculateYPosition(size);
        setCapacityYPosition(capacityYPosition);

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
            upperWidth +
            (lowerWidth - upperWidth) * (capacityYPosition / height);
        const innerUpperLeft: [number, number] = [
            ((upperWidth - baseCut) / 2) * scale,
            capacityYPosition * scale,
        ];
        const innerUpperRight: [number, number] = [
            ((upperWidth + baseCut) / 2) * scale,
            capacityYPosition * scale,
        ];

        // Draw Full trapezoid
        const capacity = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'polygon'
        );
        capacity.setAttribute('id', capacityPolygonId);
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
            calculateXPosition,
            calculateYPosition,
            scale
        );

        const highPercentileLine = hasHighPercentile
            ? addLine(highPercentileId, highPercentile, '#FFF')
            : null;
        const averageLine = addLine(averageId, average, '#d0a02a');
        const lowPercentileLine = addLine(
            lowPercentileId,
            lowPercentile,
            '#FFF'
        );

        if (labels) {
            const addLabel = addLabelConstructor(
                upperWidth,
                svgRef.current,
                calculateXPosition,
                calculateYPosition
            );

            const addText = addTextConstructor(
                svgRef.current,
                calculateYPosition
            );

            // Add high percentile line and label

            const highLabelTSpanData = hasHighPercentile
                ? getHighPercentileLabel()
                : [];

            const highLabel = hasHighPercentile
                ? addLabel(
                      highPercentileLabelId,
                      highLabelTSpanData,
                      highPercentile,
                      textColor
                  )
                : null;

            // Add average line and label

            // Adjust the average label position if too close to high percentile label
            let averageAdjust = 0;
            if (
                hasAverage &&
                hasHighPercentile &&
                average - highPercentile < 40
            ) {
                const height =
                    hasHighPercentile && highLabel ? getHeight(highLabel) : -1;

                averageAdjust = Math.max(
                    0,
                    height - (average - highPercentile + 1)
                );
            }

            const averageLabelTSpanData = hasAverage
                ? getAverageLabel(averageAdjust)
                : [];

            const averageLabel = hasAverage
                ? addLabel(
                      averageLabelId,
                      averageLabelTSpanData,
                      average,
                      '#d0a02a'
                  )
                : null;

            // Add low percentile line and label

            // Adjust the low percentile label position if too close to average label
            // Handle if average is also too close to high percentile
            let lowPercentileAdjust = 0;
            if (
                hasAverage &&
                hasLowPercentile &&
                lowPercentile - average < 40
            ) {
                const height =
                    hasAverage && averageLabel ? getHeight(averageLabel) : -1;

                lowPercentileAdjust =
                    Math.max(0, height - (lowPercentile - average + 1)) +
                    averageAdjust;
            }

            if (hasLowPercentile) {
                const lowLabelTSpanData =
                    getLowPercentileLabel(lowPercentileAdjust);

                addLabel(
                    lowPercentileLabelId,
                    lowLabelTSpanData,
                    lowPercentile,
                    textColor
                );
            }

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

            const highPercentileY =
                hasHighPercentile && highPercentileLine
                    ? calculateYPosition(highPercentile)
                    : -1;
            const averageY = calculateYPosition(average);
            const lowPercentileY = calculateYPosition(lowPercentile);

            const minSpacing = 9;
            averageAdjust = 0;

            // Check overlap with high percentile line
            if (
                hasAverage &&
                hasHighPercentile &&
                Math.abs(highPercentileY - averageY) < minSpacing
            ) {
                averageAdjust +=
                    (highPercentileY <= averageY ? 1 : -1) *
                    (minSpacing + 9 - Math.abs(highPercentileY - averageY));
            }

            // Check overlap with low percentile line
            if (
                hasAverage &&
                hasLowPercentile &&
                Math.abs(lowPercentileY - averageY + averageAdjust) < minSpacing
            ) {
                averageAdjust +=
                    (lowPercentileY <= averageY ? 1 : -1) *
                    (minSpacing +
                        9 -
                        Math.abs(lowPercentileY - averageY + averageAdjust));
            }

            if (hasAverage) {
                addText(
                    averageTextId,
                    `${Math.round(
                        Number(
                            reservoirProperties[
                                config.thirtyYearAverageProperty
                            ]
                        )
                    ).toLocaleString('en-us')} acre-feet`,
                    average - 2 + averageAdjust,
                    '#d0a02a',
                    showLabels
                );
            }

            // Current Storage of reservoir
            addText(
                storageTextId,
                `${Number(
                    reservoirProperties[config.storageProperty]
                ).toLocaleString('en-us')} acre-feet`,
                height + 6,
                textColor,
                showLabels
            );
        }

        // Now that the diagram is created, call the callback function if exists
        // Used when creating the diagram for the report
        callback?.();
    }, [svgRef.current, colorScheme, reservoirProperties]);

    useEffect(() => {
        if (isInvalidGraphic || !listeners || capacityYPosition === undefined) {
            return;
        }

        const hasHighPercentile = highPercentile !== undefined;
        const hasAverage = average !== undefined;
        const hasLowPercentile = lowPercentile !== undefined;

        const propagateEventToContainerElem =
            propagateEventToContainerElemConstructor(
                _capacityPolygonId,
                _storagePolygonId,
                capacityYPosition
            );

        const cleanups: (() => void)[] = [];

        cleanups.push(
            addListeners(_capacityPolygonId, {
                mouseenter: handleCapacityEnter,
                mouseleave: () => handleCapacityLeave(showLabels),
            })!
        );

        cleanups.push(
            addListeners(_storagePolygonId, {
                mouseenter: handleStorageEnter,
                mouseleave: () => handleStorageLeave(showLabels),
            })!
        );

        if (hasHighPercentile) {
            const highPercentileHandler =
                (type: 'mouseenter' | 'mouseleave') => () =>
                    propagateEventToContainerElem(type, highPercentile);

            cleanups.push(
                addListeners(_highPercentileId, {
                    mouseenter: highPercentileHandler('mouseenter'),
                    mouseleave: highPercentileHandler('mouseleave'),
                })!
            );

            cleanups.push(
                addListeners(`${_highPercentileId}-ghost`, {
                    mouseenter: highPercentileHandler('mouseenter'),
                    mouseleave: highPercentileHandler('mouseleave'),
                })!
            );
        }

        if (hasAverage) {
            const averageHandler =
                (type: 'mouseenter' | 'mouseleave') => () => {
                    if (type === 'mouseenter') handleAverageLineEnter();
                    else handleAverageLineLeave(showLabels);

                    propagateEventToContainerElem(type, average);
                };

            cleanups.push(
                addListeners(_averageId, {
                    mouseenter: averageHandler('mouseenter'),
                    mouseleave: averageHandler('mouseleave'),
                })!
            );

            cleanups.push(
                addListeners(`${_averageId}-ghost`, {
                    mouseenter: averageHandler('mouseenter'),
                    mouseleave: averageHandler('mouseleave'),
                })!
            );

            cleanups.push(
                addListeners(_averageTextId, {
                    mouseenter: averageHandler('mouseenter'),
                    mouseleave: averageHandler('mouseleave'),
                })!
            );
        }

        if (hasLowPercentile) {
            const lowPercentileHandler =
                (type: 'mouseenter' | 'mouseleave') => () =>
                    propagateEventToContainerElem(type, lowPercentile);

            cleanups.push(
                addListeners(_lowPercentileId, {
                    mouseenter: lowPercentileHandler('mouseenter'),
                    mouseleave: lowPercentileHandler('mouseleave'),
                })!
            );

            cleanups.push(
                addListeners(`${_lowPercentileId}-ghost`, {
                    mouseenter: lowPercentileHandler('mouseenter'),
                    mouseleave: lowPercentileHandler('mouseleave'),
                })!
            );
        }

        return () => {
            cleanups.forEach((cleanup) => cleanup?.());
        };
    }, [
        listeners,
        colorScheme,
        showLabels,
        average,
        reservoirProperties![config.identifierProperty],
    ]);

    if (isInvalidGraphic) {
        return (
            <Group h={127} justify="center" align="center" grow>
                <Text size="sm">Missing required data</Text>
            </Group>
        );
    }

    return (
        <svg
            data-testid="graphic-svg"
            viewBox={`-5 -10 ${labels ? 220 : 170} 127`}
            className={className}
            ref={_graphicRef}
        >
            <defs>
                <filter id="shadow">
                    <feDropShadow dx="0.5" dy="0.4" stdDeviation="0.4" />
                </filter>
            </defs>
            <g ref={svgRef} key={colorScheme}></g>
        </svg>
    );
};
