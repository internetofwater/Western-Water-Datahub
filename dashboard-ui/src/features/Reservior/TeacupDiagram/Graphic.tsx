/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { MantineColorScheme } from '@mantine/core';
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
    labels?: boolean;
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
        labels = true,
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
            calculateXPosition
        );

        addLine(highPercentileId, highPercentile, '#FFF');
        addLine(averageId, average, '#d0a02a');
        addLine(lowPercentileId, lowPercentile, '#FFF');

        if (labels) {
            const addLabel = addLabelConstructor(
                upperWidth,
                svgRef.current,
                calculateXPosition
            );

            const addText = addTextConstructor(svgRef.current);

            // Add high percentile line and label

            const highLabelTSpanData = getHighPercentileLabel();

            const highLabel = addLabel(
                highPercentileLabelId,
                highLabelTSpanData,
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

            const averageLabelTSpanData = getAverageLabel(averageAdjust);

            const averageLabel = addLabel(
                averageLabelId,
                averageLabelTSpanData,
                average,
                '#d0a02a'
            );

            // Add low percentile line and label

            // Adjust the low percentile label position if too close to average label
            // Handle if average is also too close to high percentile
            let lowPercentileAdjust = 0;
            if (lowPercentile - average < 40) {
                const height = averageLabel.getBBox().height;

                lowPercentileAdjust =
                    Math.max(0, height - (lowPercentile - average + 1)) +
                    averageAdjust;
            }

            const lowLabelTSpanData =
                getLowPercentileLabel(lowPercentileAdjust);

            addLabel(
                lowPercentileLabelId,
                lowLabelTSpanData,
                lowPercentile,
                textColor
            );

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
                    (Number(reservoirProperties[config.storageProperty]) / 2) *
                        1.3
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
        }

        // Now that the diagram is created, call the callback function if exists
        // Used when creating the diagram for the report
        callback?.();
    }, [
        svgRef.current,
        colorScheme,
        reservoirProperties![config.identifierProperty],
    ]);

    useEffect(() => {
        if (
            !listeners ||
            cutHeight === undefined ||
            highPercentile === undefined ||
            average === undefined ||
            lowPercentile === undefined
        ) {
            return;
        }

        const propagateEventToContainerElem =
            propagateEventToContainerElemConstructor(
                _capacityPolygonId,
                _storagePolygonId,
                cutHeight
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

        const averageHandler = (type: 'mouseenter' | 'mouseleave') => () => {
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

    return (
        <svg
            data-testid="graphic-svg"
            viewBox={`-5 -10 ${labels ? 220 : 170} 127`}
            className={styles.svg}
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
