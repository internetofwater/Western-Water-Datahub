import { ReservoirConfig } from '@/features/Map/types';
import { AspectRatio, Box, Group, Paper, Stack, Title } from '@mantine/core';
import styles from '@/features/Reservior/Reservoir.module.css';
import { useEffect, useRef, useState } from 'react';
import {
    addLabelConstructor,
    addLineConstructor,
    addTextConstructor,
    calculateInnerTrapezoidHeight,
    calculateXPositionConstructor,
    propagateEventToContainerElemConstructor,
} from '@/features/Reservior/utils';
import { GeoJsonProperties } from 'geojson';
import { renderToStaticMarkup } from 'react-dom/server';

type Props = {
    reservoirProperties: GeoJsonProperties;
    config: ReservoirConfig;
};

export const Graphic: React.FC<Props> = (props) => {
    const { reservoirProperties, config } = props;

    const [storageHover, setStorageHover] = useState(false);
    const [capacityHover, setCapacityHover] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);

    // Define Id's of elements for reference
    const storagePolygonId = 'storage-polygon';
    const capacityPolygonId = 'capacity-polygon';
    const highPercentileId = 'high-percentile-line';
    const highPercentileLabelId = 'high-percentile-label';
    const averageId = 'average-line';
    const lowPercentileId = 'low-percentile-line';
    const capacityTextId = 'capacity-text';
    const averageTextId = 'average-text';
    const storageTextId = 'storage-text';

    const handleStorageEnter = () => {
        setStorageHover(true);
        const storageElement = document.getElementById(storagePolygonId);
        const storageTextElement = document.getElementById(storageTextId);

        if (storageElement && storageTextElement) {
            storageElement.setAttribute('stroke-width', '2');
            storageTextElement.setAttribute('display', 'inline');
        }
    };
    const handleStorageLeave = () => {
        setStorageHover(false);
        const storageElement = document.getElementById(storagePolygonId);
        const storageTextElement = document.getElementById(storageTextId);

        if (storageElement && storageTextElement) {
            storageElement.setAttribute('stroke-width', '0');
            storageTextElement.setAttribute('display', 'none');
        }
    };
    const handleCapacityEnter = () => {
        setCapacityHover(true);
        const capacityElement = document.getElementById(capacityPolygonId);
        const capacityTextElement = document.getElementById(capacityTextId);

        if (capacityElement && capacityTextElement) {
            // capacityElement.setAttribute('stroke-width', '2');
            capacityTextElement.setAttribute('display', 'inline');
        }
    };
    const handleCapacityLeave = () => {
        setCapacityHover(false);
        const capacityElement = document.getElementById(capacityPolygonId);
        const capacityTextElement = document.getElementById(capacityTextId);

        if (capacityElement && capacityTextElement) {
            capacityElement.setAttribute('stroke-width', '0');
            capacityTextElement.setAttribute('display', 'none');
        }
    };

    useEffect(() => {
        if (!svgRef.current || !reservoirProperties || !config) {
            return;
        }

        svgRef.current.innerHTML = '';

        const percentOfFull =
            Number(reservoirProperties[config.storageProperty]) /
            2 /
            Number(reservoirProperties[config.capacityProperty]);

        // Determine basic dimensions of teacup trapezoid
        const size = 1 - Number(percentOfFull.toFixed(2));
        const upperBase = 160;
        const lowerBase = 64;
        const height = 107;
        const scale = 1;

        // Calculate the height of the sub-trapezoid representing storage
        const cutHeight = calculateInnerTrapezoidHeight(
            size,
            upperBase,
            lowerBase,
            height
        );

        // Calculate points defining the primary (capacity) trapezoid
        const A: [number, number] = [0, 0];
        const B: [number, number] = [upperBase * scale, 0];
        const C: [number, number] = [
            ((upperBase + lowerBase) / 2) * scale,
            height * scale,
        ];
        const D: [number, number] = [
            ((upperBase - lowerBase) / 2) * scale,
            height * scale,
        ];

        // Calculate the points of the inner (storage) trapezoid
        const baseCut =
            upperBase + (lowerBase - upperBase) * (cutHeight / height);
        const G: [number, number] = [
            ((upperBase + baseCut) / 2) * scale,
            cutHeight * scale,
        ];
        const H: [number, number] = [
            ((upperBase - baseCut) / 2) * scale,
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
        capacity.setAttribute('filter', 'url(#shadow)');
        capacity.setAttribute(
            'points',
            `${A.join(',')} ${B.join(',')} ${C.join(',')} ${D.join(',')}`
        );
        capacity.setAttribute('fill', '#a6d5e3');
        svgRef.current.appendChild(capacity);

        // Draw inner trapezoid
        const storage = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'polygon'
        );
        storage.setAttribute('id', storagePolygonId);
        storage.setAttribute('stroke', '#00b8f0');
        storage.setAttribute('stroke-width', '0');
        // storage.setAttribute('class', 'grow');
        storage.setAttribute(
            'points',
            `${H.join(',')} ${G.join(',')} ${C.join(',')} ${D.join(',')}`
        );
        storage.setAttribute('fill', '#1c638e');
        svgRef.current.appendChild(storage);

        const highPercentile = height - 95;
        const average = height - 81;
        const lowPercentile = height - 40;

        const propagateEventToContainerElem =
            propagateEventToContainerElemConstructor(
                capacityPolygonId,
                storagePolygonId,
                cutHeight
            );

        const calculateXPosition = calculateXPositionConstructor(A, D, 0);

        const addLine = addLineConstructor(
            upperBase,
            svgRef.current,
            calculateXPosition
        );

        const addText = addTextConstructor(upperBase, svgRef.current);

        addLine(
            highPercentileId,
            highPercentile,
            '#FFF',
            () => {
                propagateEventToContainerElem('mouseenter', highPercentile);
            },
            () => {
                propagateEventToContainerElem('mouseenter', highPercentile);
            }
        );
        // const addHighLabel = addLabelConstructor(
        //     upperBase,
        //     svgRef.current,
        //     calculateXPosition
        // );
        // const highLabelText = renderToStaticMarkup(
        //     <>
        //         <tspan dy="0" fontWeight="bold">
        //             High
        //         </tspan>
        //         <tspan dy="20">
        //             {' '}
        //             (90
        //             <tspan dy="-10" fontSize="12">
        //                 th
        //             </tspan>{' '}
        //             Percentile)
        //         </tspan>
        //     </>
        // );
        // console.log('highLabelText', highLabelText);
        // addHighLabel(
        //     highPercentileLabelId,
        //     highLabelText,
        //     highPercentile,
        //     '#000'
        // );

        addLine(
            averageId,
            average,
            '#d0a02a',
            () => {
                const averageTextElement =
                    document.getElementById(averageTextId);

                if (averageTextElement) {
                    averageTextElement.setAttribute('display', 'inline');
                }

                propagateEventToContainerElem('mouseenter', average);
            },
            () => {
                const averageTextElement =
                    document.getElementById(averageTextId);

                if (averageTextElement) {
                    averageTextElement.setAttribute('display', 'none');
                }

                propagateEventToContainerElem('mouseleave', average);
            }
        );

        addLine(
            lowPercentileId,
            lowPercentile,
            '#FFF',
            () => {
                propagateEventToContainerElem('mouseenter', lowPercentile);
            },
            () => {
                propagateEventToContainerElem('mouseleave', lowPercentile);
            }
        );

        addText(
            capacityTextId,
            `${Number(
                reservoirProperties[config.capacityProperty]
            ).toLocaleString('en-us')} acre-feet`,
            -1,
            '#000',
            false
        );
        addText(averageTextId, `${0} acre-feet`, average - 2, '#d0a02a', false);
        addText(
            storageTextId,
            `${(
                Number(reservoirProperties[config.storageProperty]) / 2
            ).toLocaleString('en-us')} acre-feet`,
            cutHeight - 1,
            '#FFF',
            false
        );

        const addHandleCapacityEnter = () => {
            handleCapacityEnter();
        };
        const addHandleCapacityLeave = () => {
            handleCapacityLeave();
        };
        const addHandleStorageEnter = () => {
            handleStorageEnter();
        };
        const addHandleStorageLeave = () => {
            handleStorageLeave();
        };

        capacity.addEventListener('mouseenter', addHandleCapacityEnter);
        capacity.addEventListener('mouseleave', addHandleCapacityLeave);

        storage.addEventListener('mouseenter', addHandleStorageEnter);
        storage.addEventListener('mouseleave', addHandleStorageLeave);

        return () => {
            capacity.removeEventListener('mouseenter', addHandleCapacityEnter);
            capacity.removeEventListener('mouseleave', addHandleCapacityLeave);

            storage.removeEventListener('mouseenter', addHandleStorageEnter);
            storage.removeEventListener('mouseleave', addHandleStorageLeave);
        };
    }, [svgRef]);

    return (
        <Paper
            shadow="xs"
            p="xs"
            className={`${styles.infoContainer} ${styles.graphicContainer}`}
        >
            <Stack justify="space-between">
                <Title order={3} size="h5">
                    Storage Volume (acre-feet)
                </Title>
                <Box className={styles.svgWrapper}>
                    <svg
                        id="trapezoidSVG"
                        height="290"
                        viewBox="-5 -10 170 127"
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
            </Stack>
        </Paper>
    );
};
