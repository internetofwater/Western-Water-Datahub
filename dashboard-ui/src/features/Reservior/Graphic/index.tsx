/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { ReservoirConfig } from '@/features/Map/types';
import {
    Box,
    Group,
    Paper,
    Stack,
    Switch,
    Title,
    Text,
    useMantineColorScheme,
} from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { useEffect, useRef, useState } from 'react';
import {
    addLabelConstructor,
    addLineConstructor,
    addTextConstructor,
    calculateInnerTrapezoidHeight,
    calculateXPositionConstructor,
    propagateEventToContainerElemConstructor,
} from '@/features/Reservior/Graphic/utils';
import { GeoJsonProperties } from 'geojson';
import { renderToStaticMarkup } from 'react-dom/server';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

export const Graphic: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const [showLabels, setShowLabels] = useState(false);
    const [cutHeight, setCutHeight] = useState<number>();
    const [highPercentile, setHighPercentile] = useState<number>();
    const [average, setAverage] = useState<number>();
    const [lowPercentile, setLowPercentile] = useState<number>();

    const svgRef = useRef<SVGSVGElement>(null);

    const { colorScheme } = useMantineColorScheme();

    // Define Id's of elements for reference
    const storagePolygonId = 'storage-polygon';
    const capacityPolygonId = 'capacity-polygon';
    const highPercentileId = 'high-percentile-line';
    const highPercentileLabelId = 'high-percentile-label';
    const averageId = 'average-line';
    const averageTextId = 'average-text';
    const averageLabelId = 'average-label';
    const lowPercentileId = 'low-percentile-line';
    const lowPercentileLabelId = 'low-percentile-label';
    const capacityTextId = 'capacity-text';
    const storageTextId = 'storage-text';

    const capacityFill = '#a6d5e3';
    const storageFill = '#1c638e';

    const handleShowLabels = (showLabels: boolean) => {
        if (showLabels) {
            handleStorageEnter();
            handleCapacityEnter();
            handleAverageLineEnter();
        } else {
            handleStorageLeave(false);
            handleCapacityLeave(false);
            handleAverageLineLeave(false);
        }

        setShowLabels(showLabels);
    };

    // Event listener functions
    const handleStorageEnter = () => {
        const storageElement = document.getElementById(storagePolygonId);
        const storageTextElement = document.getElementById(storageTextId);

        if (storageElement && storageTextElement) {
            storageElement.setAttribute('stroke-width', '2');
            storageTextElement.setAttribute('display', 'inline');
        }
    };
    const handleStorageLeave = (_showLabels: boolean = showLabels) => {
        if (_showLabels) {
            return;
        }

        const storageElement = document.getElementById(storagePolygonId);
        const storageTextElement = document.getElementById(storageTextId);

        if (storageElement && storageTextElement) {
            storageElement.setAttribute('stroke-width', '0');
            storageTextElement.setAttribute('display', 'none');
        }
    };
    const handleCapacityEnter = () => {
        const capacityElement = document.getElementById(capacityPolygonId);
        const capacityTextElement = document.getElementById(capacityTextId);

        if (capacityElement && capacityTextElement) {
            // capacityElement.setAttribute('stroke-width', '1');
            capacityTextElement.setAttribute('display', 'inline');
        }
    };
    const handleCapacityLeave = (_showLabels: boolean = showLabels) => {
        if (_showLabels) {
            return;
        }
        const capacityElement = document.getElementById(capacityPolygonId);
        const capacityTextElement = document.getElementById(capacityTextId);

        if (capacityElement && capacityTextElement) {
            capacityElement.setAttribute('stroke-width', '0');
            capacityTextElement.setAttribute('display', 'none');
        }
    };

    const handleAverageLineEnter = () => {
        const averageTextElement = document.getElementById(averageTextId);

        if (averageTextElement) {
            averageTextElement.setAttribute('display', 'inline');
        }
    };
    const handleAverageLineLeave = (_showLabels: boolean = showLabels) => {
        if (_showLabels) {
            return;
        }

        const averageTextElement = document.getElementById(averageTextId);

        if (averageTextElement) {
            averageTextElement.setAttribute('display', 'none');
        }
    };

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
            const height = highLabel.getBoundingClientRect().height;

            averageAdjust = Math.max(
                0,
                height / 2 - (average - highPercentile + 1)
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
            const height = averageLabel.getBoundingClientRect().height;

            lowPercentileAdjust =
                Math.max(0, height / 2 - (lowPercentile - average + 1)) +
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
        // Renders just above the average line
        addText(
            averageTextId,
            `${0} acre-feet`,
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
    }, [svgRef, colorScheme]);

    useEffect(() => {
        if (!cutHeight || !highPercentile || !average || !lowPercentile) {
            return;
        }

        const propagateEventToContainerElem =
            propagateEventToContainerElemConstructor(
                capacityPolygonId,
                storagePolygonId,
                cutHeight
            );

        const capacityElement = document.getElementById(capacityPolygonId);
        const addHandleCapacityEnter = () => {
            handleCapacityEnter();
        };
        const addHandleCapacityLeave = () => {
            handleCapacityLeave();
        };

        if (capacityElement) {
            capacityElement.addEventListener(
                'mouseenter',
                addHandleCapacityEnter
            );
            capacityElement.addEventListener(
                'mouseleave',
                addHandleCapacityLeave
            );
        }

        const storageElement = document.getElementById(storagePolygonId);

        const addHandleStorageEnter = () => {
            handleStorageEnter();
        };
        const addHandleStorageLeave = () => {
            handleStorageLeave();
        };
        if (storageElement) {
            storageElement.addEventListener(
                'mouseenter',
                addHandleStorageEnter
            );
            storageElement.addEventListener(
                'mouseleave',
                addHandleStorageLeave
            );
        }

        const addHandleHPercentileEnter = () => {
            propagateEventToContainerElem('mouseenter', highPercentile);
        };
        const addHandleHPercentileLeave = () => {
            propagateEventToContainerElem('mouseenter', highPercentile);
        };

        const highPercentileLineElement =
            document.getElementById(highPercentileId);
        const highPercentileGhostLineElement = document.getElementById(
            highPercentileId + '-ghost'
        );
        if (highPercentileLineElement && highPercentileGhostLineElement) {
            highPercentileLineElement.addEventListener(
                'mouseenter',
                addHandleHPercentileEnter
            );
            highPercentileGhostLineElement.addEventListener(
                'mouseenter',
                addHandleHPercentileEnter
            );
            highPercentileLineElement.addEventListener(
                'mouseleave',
                addHandleHPercentileLeave
            );
            highPercentileGhostLineElement.addEventListener(
                'mouseleave',
                addHandleHPercentileLeave
            );
        }

        const addHandleAverageEnter = () => {
            handleAverageLineEnter();

            propagateEventToContainerElem('mouseenter', average);
        };
        const addHandleAverageLeave = () => {
            handleAverageLineLeave();

            propagateEventToContainerElem('mouseleave', average);
        };

        const averageLineElement = document.getElementById(averageId);
        const averageGhostLineElement = document.getElementById(
            averageId + '-ghost'
        );
        if (averageLineElement && averageGhostLineElement) {
            averageLineElement.addEventListener(
                'mouseenter',
                addHandleAverageEnter
            );
            averageGhostLineElement.addEventListener(
                'mouseenter',
                addHandleAverageEnter
            );
            averageLineElement.addEventListener(
                'mouseleave',
                addHandleAverageLeave
            );
            averageGhostLineElement.addEventListener(
                'mouseleave',
                addHandleAverageLeave
            );
        }

        const addHandleLPercentileEnter = () => {
            propagateEventToContainerElem('mouseenter', lowPercentile);
        };
        const addHandleLPercentileLeave = () => {
            propagateEventToContainerElem('mouseenter', lowPercentile);
        };

        const lowPercentileLineElement =
            document.getElementById(lowPercentileId);
        const lowPercentileGhostLineElement = document.getElementById(
            lowPercentileId + '-ghost'
        );
        if (lowPercentileLineElement && lowPercentileGhostLineElement) {
            lowPercentileLineElement.addEventListener(
                'mouseenter',
                addHandleLPercentileEnter
            );
            lowPercentileGhostLineElement.addEventListener(
                'mouseenter',
                addHandleLPercentileEnter
            );
            lowPercentileLineElement.addEventListener(
                'mouseleave',
                addHandleLPercentileLeave
            );
            lowPercentileGhostLineElement.addEventListener(
                'mouseleave',
                addHandleLPercentileLeave
            );
        }

        // Cleanup
        return () => {
            if (capacityElement) {
                capacityElement.removeEventListener(
                    'mouseenter',
                    addHandleCapacityEnter
                );
                capacityElement.removeEventListener(
                    'mouseleave',
                    addHandleCapacityLeave
                );
            }

            if (storageElement) {
                storageElement.removeEventListener(
                    'mouseenter',
                    addHandleStorageEnter
                );
                storageElement.removeEventListener(
                    'mouseleave',
                    addHandleStorageLeave
                );
            }

            if (highPercentileLineElement && highPercentileGhostLineElement) {
                highPercentileLineElement.removeEventListener(
                    'mouseenter',
                    addHandleHPercentileEnter
                );
                highPercentileGhostLineElement.removeEventListener(
                    'mouseenter',
                    addHandleHPercentileEnter
                );
                highPercentileLineElement.removeEventListener(
                    'mouseleave',
                    addHandleHPercentileLeave
                );
                highPercentileGhostLineElement.removeEventListener(
                    'mouseleave',
                    addHandleHPercentileLeave
                );
            }

            if (averageLineElement && averageGhostLineElement) {
                averageLineElement.removeEventListener(
                    'mouseenter',
                    addHandleAverageEnter
                );
                averageGhostLineElement.removeEventListener(
                    'mouseenter',
                    addHandleAverageEnter
                );
                averageLineElement.removeEventListener(
                    'mouseleave',
                    addHandleAverageLeave
                );
                averageGhostLineElement.removeEventListener(
                    'mouseleave',
                    addHandleAverageLeave
                );
            }

            if (lowPercentileLineElement && lowPercentileGhostLineElement) {
                lowPercentileLineElement.removeEventListener(
                    'mouseenter',
                    addHandleLPercentileEnter
                );
                lowPercentileGhostLineElement.removeEventListener(
                    'mouseenter',
                    addHandleLPercentileEnter
                );
                lowPercentileLineElement.removeEventListener(
                    'mouseleave',
                    addHandleLPercentileLeave
                );
                lowPercentileGhostLineElement.removeEventListener(
                    'mouseleave',
                    addHandleLPercentileLeave
                );
            }
        };
    }, [
        colorScheme,
        showLabels,
        cutHeight,
        highPercentile,
        average,
        lowPercentile,
    ]);

    return (
        <Paper
            shadow="xs"
            p="xs"
            className={`${styles.infoContainer} ${styles.graphicContainer}`}
        >
            <Stack align="space-between" h="100%">
                <Title order={3} size="h5">
                    Current Storage Levels
                </Title>
                <Group justify="space-between">
                    <Box className={styles.svgWrapper}>
                        <svg
                            data-testid="graphic-svg"
                            viewBox="-5 -10 220 127"
                            className={styles.svg}
                        >
                            <defs>
                                <filter id="shadow">
                                    <feDropShadow
                                        dx="0.5"
                                        dy="0.4"
                                        stdDeviation="0.4"
                                    />
                                </filter>
                            </defs>
                            <g ref={svgRef}></g>
                        </svg>
                    </Box>
                    <Stack
                        align="space-between"
                        justify="flex-start"
                        h="100%"
                        pt={15}
                    >
                        <Switch
                            label="Show Labels"
                            checked={showLabels}
                            onClick={() => handleShowLabels(!showLabels)}
                        />
                        <Paper bg="#fff">
                            <Stack p={8} data-testid="graphic-legend">
                                <Group
                                    gap={5}
                                    onMouseEnter={handleCapacityEnter}
                                    onMouseLeave={() => handleCapacityLeave()}
                                >
                                    <Box
                                        style={{
                                            backgroundColor: capacityFill,
                                        }}
                                        className={styles.graphicLegendColor}
                                    ></Box>
                                    <Text
                                        size="sm"
                                        c="#000"
                                        fw={700}
                                        className={styles.graphicLegendText}
                                    >
                                        Capacity
                                    </Text>
                                </Group>
                                <Group
                                    gap={5}
                                    onMouseEnter={handleStorageEnter}
                                    onMouseLeave={() => handleStorageLeave()}
                                >
                                    <Box
                                        style={{ backgroundColor: storageFill }}
                                        className={styles.graphicLegendColor}
                                    ></Box>
                                    <Text
                                        size="sm"
                                        c="#000"
                                        fw={700}
                                        className={styles.graphicLegendText}
                                    >
                                        Storage
                                    </Text>
                                </Group>
                            </Stack>
                        </Paper>
                    </Stack>
                </Group>
            </Stack>
        </Paper>
    );
};
