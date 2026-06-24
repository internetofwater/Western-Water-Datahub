/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';
import {
    ReservoirConfigId,
    ReservoirConfigProperties,
} from '@/features/Map/types';
import {
    getAllReservoirConfigs,
    getReservoirConfig,
} from '@/features/Map/utils';
import {
    addLineConstructor,
    calculateXPositionConstructor,
    calculateYPositionContructor,
} from '@/features/Reservior/TeacupDiagram/utils';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Map } from 'mapbox-gl';
import { bbox, featureCollection } from '@turf/turf';
import dayjs from 'dayjs';
import { OrganizedProperties } from '@/features/Reservoirs/types';
import {
    RESERVOIR_POSITIONS,
    TAG_COLORS,
    TAGS,
} from '@/services/report/report.consts';

export type TCallbackResponse = {
    success: boolean;
    message: string;
};

export class ReportService {
    /**
     * Generate a png report reflecting user choices in the dashboard showcasing current reservoir conditions
     *
     * @public
     * @param {Map} map - Map instance to modify for creating report imagery
     * @param {Feature<Point, OrganizedProperties>[]} reservoirs - List of reservoirs to include in report
     * @param {(string | null)} date - Currently selected reservoir date or null for latest date
     * @param {?(response: TCallbackResponse) => void} [callback] - Callback function called after successful download
     */
    public report(
        map: Map,
        reservoirs: Feature<Point, OrganizedProperties>[],
        date: string | null,
        callback?: (response: TCallbackResponse) => void
    ) {
        this.positionView(map, reservoirs);
        this.modifyLayers(map);
        const container = map.getContainer();
        let svgOverlay = this.addSVGLayer(container);

        svgOverlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgOverlay.setAttribute('font-family', 'Arial, Helvetica, sans-serif');

        const root = { x: 0, y: 0 };
        const { innerRect, outerRect } = this.createBorders();
        svgOverlay = this.drawSVGAtPosition(root, outerRect, svgOverlay);
        svgOverlay = this.drawSVGAtPosition(root, innerRect, svgOverlay);

        // Draw in reverse order to place alphabetical tags on top
        for (let i = reservoirs.length - 1; i >= 0; i--) {
            const reservoir = reservoirs[i];
            const config = getReservoirConfig(
                reservoir.properties.sourceId as ReservoirConfigId
            );
            if (config) {
                // Geographic position of reservoir
                const point = reservoir.geometry.coordinates as [
                    number,
                    number,
                ];
                // In report position of supplemental reservoir information (graphic, card, tag)
                const position = RESERVOIR_POSITIONS[i];

                // Draw color indicator of reservoir geographic position
                const mapPositionCircle = this.createCircle(i);

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    mapPositionCircle,
                    svgOverlay
                );

                // Draw character indicator of reservoir geographic position
                const mapTag = this.createTag(i);

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    mapTag,
                    svgOverlay
                );

                // Draw teacup graphic
                const reservoirSVG = this.createReservoirSVG(config, reservoir);

                svgOverlay = this.drawSVGAtPosition(
                    position,
                    reservoirSVG,
                    svgOverlay
                );

                // Draw information box
                const infoSVG = this.createInfoBox(config, reservoir);

                // Draw this svg, then calculate the width in the dom to reposition
                svgOverlay = this.drawSVG(infoSVG, svgOverlay);

                // Bounding rect wont reflect bounds accurately until end of next frame
                requestAnimationFrame(() => {
                    const { width: infoBoxWidth } =
                        infoSVG.getBoundingClientRect();

                    const infoBoxPosition = {
                        x: position.x - Math.abs(160 - infoBoxWidth) / 2,
                        y:
                            position.y +
                            (Number(reservoirSVG.getAttribute('height')) ?? 0),
                    };

                    this.repostion(infoBoxPosition, infoSVG);

                    // Create duplicate of color indicator to prevent mutation
                    const indicatorCircle = this.createCircle(i);
                    const indicatorPosition = {
                        x: position.x - Math.abs(160 - infoBoxWidth) / 2 - 2, // position at bottom left corner
                        y:
                            position.y +
                            (Number(reservoirSVG.getAttribute('height')) ?? 0) -
                            6,
                    };

                    svgOverlay = this.drawSVGAtPosition(
                        indicatorPosition,
                        indicatorCircle,
                        svgOverlay
                    );

                    // Create duplicate of tag indicator to prevent mutation
                    const infoTag = this.createTag(i);

                    svgOverlay = this.drawSVGAtPosition(
                        indicatorPosition,
                        infoTag,
                        svgOverlay
                    );
                });
            }
        }

        // Force refresh of map state
        // Wait for map to render
        map.triggerRepaint();
        map.once('idle', () => {
            this.exportCombinedImage(map, svgOverlay, date, callback);
        });
    }

    private positionView(map: Map, reservoirs: Feature<Point>[]) {
        const collection = featureCollection(reservoirs);

        const [minLng, minLat, maxLng, maxLat] = bbox(collection);

        map.resize();
        map.fitBounds(
            [
                [minLng, minLat], // southwest
                [maxLng, maxLat], // northeast
            ],
            // Fit padding to dimension of shapes
            {
                padding: {
                    top: 270,
                    left: 300,
                    right: 320,
                    bottom: 270,
                },
                maxZoom: 16,
                duration: 0,
                animate: false,
            }
        );
    }

    private modifyLayers(map: Map) {
        map.setLayoutProperty(SubLayerId.RegionsFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.RegionsBoundary, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.BasinsFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.BasinsBoundary, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.StatesFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.StatesBoundary, 'visibility', 'none');
        for (const config of getAllReservoirConfigs()) {
            [config.iconLayer, config.labelLayer].forEach((layerId) => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                }
            });
        }
    }

    private createBorders() {
        const outerRectWidth = 50;
        const innerRectWidth = 5;
        const unit = 'px';

        const outerRect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
        );

        outerRect.setAttribute('width', '100%');
        outerRect.setAttribute('height', '100%');
        outerRect.setAttribute('x', `0`);
        outerRect.setAttribute('y', `0`);
        outerRect.setAttribute('fill', 'none');
        outerRect.setAttribute('stroke', '#0081a1');
        outerRect.setAttribute('stroke-width', `${outerRectWidth}${unit}`);

        const innerRect = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
        );
        innerRect.setAttribute(
            'width',
            `calc(100% - ${outerRectWidth}${unit})`
        );
        innerRect.setAttribute(
            'height',
            `calc(100% - ${outerRectWidth}${unit})`
        );
        innerRect.setAttribute('x', `${outerRectWidth / 2}`);
        innerRect.setAttribute('y', `${outerRectWidth / 2}`);
        innerRect.setAttribute('fill', 'none');
        innerRect.setAttribute('stroke', '#c2850c');
        innerRect.setAttribute('stroke-width', `${innerRectWidth}${unit}`);

        return { outerRect, innerRect };
    }

    private addSVGLayer(container: HTMLElement): SVGSVGElement {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        svg.setAttribute('class', 'svg-overlay');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        container.appendChild(svg);

        return svg;
    }

    private getDevicePixelRatio(): number {
        if (window?.devicePixelRatio) {
            return 1 / window.devicePixelRatio;
        }
        return 1;
    }

    private invertHexToBW(hex: string): string {
        let safeHex = hex;
        /**
         * Returns black (`#000000`) for light colors and white (`#ffffff`) for dark colors
         * using a simplified luminance calculation and a threshold of 128.
         *
         * Luminance is approximated using the WCAG coefficients (0.2126, 0.7152, 0.0722)
         * applied to RGB values without gamma correction. Any alpha channel present in the
         * input is ignored.
         */

        // Validate hex color format
        if (
            !/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(
                hex
            )
        ) {
            throw new Error('Invalid hex color');
        }

        // Remove the '#' if present
        safeHex = safeHex.replace(/^#/, '');

        // Expand shorthand form (e.g. "FFF") to full form (e.g. "FFFFFF")
        if (safeHex.length === 3 || safeHex.length === 4) {
            safeHex = safeHex
                .split('')
                .map((char) => char + char)
                .join('');
        }

        const r = parseInt(safeHex.slice(0, 2), 16);
        const g = parseInt(safeHex.slice(2, 4), 16);
        const b = parseInt(safeHex.slice(4, 6), 16);

        // Partial implementation of relative luminance calculation
        // that does not caclulate gamma correction
        // https://www.w3.org/TR/WCAG20/#relativeluminancedef
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance > 128 ? '#000000' : '#ffffff';
    }

    private createCircle(index: number): SVGCircleElement {
        const circle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
        );

        const color = TAG_COLORS[index];

        circle.setAttribute(
            'stroke',
            `color-mix(in srgb, ${color} 70%, black)`
        );

        circle.setAttribute('stroke-width', `3`);

        circle.setAttribute('fill', color);

        circle.setAttribute('r', '14');

        return circle;
    }

    private createTag(index: number): SVGTextElement {
        const tag = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
        );
        tag.textContent = TAGS[index].toUpperCase();

        const color = this.invertHexToBW(TAG_COLORS[index]);
        tag.setAttribute('text-anchor', 'middle');
        tag.setAttribute('dominant-baseline', 'middle');
        tag.setAttribute('fill', color);
        tag.setAttribute('font-size', '14');
        tag.setAttribute('font-weight', 'bold');
        tag.setAttribute('font-family', 'sans-serif');

        return tag;
    }

    private breakLines(text: string): string[] {
        const splitIndex = text.indexOf('(');

        const wrap = (input: string): string[] => {
            const lines: string[] = [];
            let line = '';

            for (const word of input.split(' ')) {
                const next = (line + word + ' ').trim();

                if (next.length > 22 && line.length > 0) {
                    lines.push(line.trim());
                    line = word + ' ';
                } else {
                    line += word + ' ';
                }
            }

            if (line.trim().length > 0) {
                lines.push(line.trim());
            }

            return lines;
        };

        // Contains "("
        if (splitIndex !== -1) {
            const firstPart = text.slice(0, splitIndex).trim();
            const secondPart = text.slice(splitIndex).trim();

            const firstLines = wrap(firstPart);
            const secondLines = wrap(secondPart);

            // Only take first line of each side to guarantee 2 total lines
            return [
                firstLines.join(' '), // merge if wrapped internally
                secondLines.join(' '),
            ];
        }

        // No "("
        return wrap(text);
    }

    private createInfoBox(
        config: ReservoirConfigProperties,
        reservoir: Feature<Point, GeoJsonProperties>
    ): SVGSVGElement {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        svg.setAttribute('fill', '#000');
        svg.setAttribute('font-size', '14px');

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(g);

        const name = this.breakLines(
            String(reservoir.properties![config.longLabelProperty])
        );

        const storageNum = Number(
            reservoir.properties![config.storageProperty]
        );
        const storage = isNaN(storageNum)
            ? 'N/A'
            : storageNum.toLocaleString('en-us');
        const capacityNum = Number(
            reservoir.properties![config.capacityProperty]
        );
        const capacity = isNaN(capacityNum)
            ? 'N/A'
            : capacityNum.toLocaleString('en-us');

        const averageNum = Number(
            reservoir.properties![config.thirtyYearAverageProperty]
        );
        const average = isNaN(averageNum)
            ? 'N/A'
            : averageNum.toLocaleString('en-us');

        const lines = [...name, `Storage: ${storage} / ${capacity} ac-ft`];

        if (storage !== 'N/A' && capacity !== 'N/A') {
            let line = `${Math.round((storageNum / capacityNum) * 100)} % Full`;
            if (average !== 'N/A') {
                line += ` - ${Math.round(
                    (averageNum / capacityNum) * 100
                )}% Avg`;
            }
            lines.push(line);
        }

        const date = dayjs(
            String(reservoir.properties![config.storageDateProperty])
        );
        if (date.isValid()) {
            lines.push(`Data as of ${date.format('MMM DD, YYYY')}`);
        }

        lines.forEach((text, i) => {
            const t = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text'
            );
            // Name
            if (i < name.length) {
                t.setAttribute('font-weight', 'bold');
            }
            t.textContent = text;
            t.setAttribute('x', '8');
            t.setAttribute('y', `${20 + i * 16}`);
            g.appendChild(t);
        });

        const defs = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'defs'
        );
        const dropShadowId = `drop-shadow-${reservoir.properties![config.identifierProperty]}`;
        const filter = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'filter'
        );
        filter.setAttribute('id', dropShadowId);
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');

        const shadow = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'feDropShadow'
        );
        shadow.setAttribute('dx', '0');
        shadow.setAttribute('dy', '2');
        shadow.setAttribute('stdDeviation', '3');
        shadow.setAttribute('flood-color', '#000');
        shadow.setAttribute('flood-opacity', '0.3');

        filter.appendChild(shadow);
        defs.appendChild(filter);
        svg.appendChild(defs);

        requestAnimationFrame(() => {
            const bbox = g.getBBox();

            const padding = 16;
            const shadowPad = 12;

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect'
            );

            const width = Math.min(bbox.width + padding, 250);
            const height = bbox.height + padding;
            rect.setAttribute('x', `${bbox.x - 8}`);
            rect.setAttribute('y', `${bbox.y - 8}`);
            rect.setAttribute('width', `${width}`);
            rect.setAttribute('height', `${height}`);
            rect.setAttribute('fill', '#fff');
            rect.setAttribute('rx', '6');
            rect.setAttribute('ry', '6');
            // Apply dropshadow
            rect.setAttribute('filter', `url(#${dropShadowId})`);

            svg.insertBefore(rect, g);

            svg.setAttribute(
                'viewBox',
                `0 0 ${width + shadowPad * 2} ${height + shadowPad * 2}`
            );

            svg.setAttribute('width', `${width + shadowPad * 2}`);
            svg.setAttribute('height', `${height + shadowPad * 2}`);
        });

        return svg;
    }

    private createReservoirSVG(
        config: ReservoirConfigProperties,
        reservoir: Feature<Point, GeoJsonProperties>
    ): SVGSVGElement {
        const storagePercentage = Math.min(
            Number(reservoir.properties![config.storageProperty]) /
                Number(reservoir.properties![config.capacityProperty]),
            1
        );

        const ninetiethPercentage =
            Number(reservoir.properties![config.ninetiethPercentileProperty]) /
            Number(reservoir.properties![config.capacityProperty]);
        const averagePercentage =
            Number(reservoir.properties![config.thirtyYearAverageProperty]) /
            Number(reservoir.properties![config.capacityProperty]);
        const tenthPercentage =
            Number(reservoir.properties![config.tenthPercentileProperty]) /
            Number(reservoir.properties![config.capacityProperty]);

        const size = 1 - Number(storagePercentage.toFixed(2));
        const upperWidth = 160;
        const lowerWidth = 64;
        const height = 107;
        const scale = 0.95;

        const highPercentile = 1 - Number(ninetiethPercentage.toFixed(2));
        const average = 1 - Number(averagePercentage.toFixed(2));
        const lowPercentile = 1 - Number(tenthPercentage.toFixed(2));

        const calculateYPosition = calculateYPositionContructor(
            upperWidth,
            lowerWidth,
            height
        );
        const cutHeight = calculateYPosition(size);

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

        const calculateXPosition = calculateXPositionConstructor(
            upperLeft,
            lowerLeft,
            0
        );

        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        svg.setAttribute('width', upperWidth.toString());
        svg.setAttribute('height', height.toString());

        const strokeWidth = 2;
        // Add padding to show full outline polygon
        svg.setAttribute(
            'viewBox',
            `${-strokeWidth} ${-strokeWidth} ${upperWidth + strokeWidth * 2} ${height + strokeWidth * 2}`
        );

        // Border, drawn first to not obscure other elems
        const outlinePolygon = document.createElementNS(
            svg.namespaceURI,
            'polygon'
        );

        outlinePolygon.setAttribute('fill', 'none');
        outlinePolygon.setAttribute('stroke', '#000');
        outlinePolygon.setAttribute('stroke-width', `${strokeWidth * 2}`); // Stroke is middle positioned, double to place 2px outside
        outlinePolygon.setAttribute('stroke-linejoin', 'miter');
        outlinePolygon.setAttribute('vector-effect', 'non-scaling-stroke'); // Ensures consistency in stroke width across all scales

        outlinePolygon.setAttribute(
            'points',
            `${upperLeft.join(',')} ${upperRight.join(',')} ${lowerRight.join(',')} ${lowerLeft.join(',')}`
        );

        svg.appendChild(outlinePolygon);

        // Capacity shape
        const outerPolygon = document.createElementNS(
            svg.namespaceURI,
            'polygon'
        );
        outerPolygon.setAttribute('fill', '#a6d5e3');
        outerPolygon.setAttribute(
            'points',
            `${upperLeft.join(',')} ${upperRight.join(',')} ${lowerRight.join(
                ','
            )} ${lowerLeft.join(',')}`
        );
        outerPolygon.setAttribute('shape-rendering', 'geometricPrecision'); // Smooths polygon edge (no stair step)

        svg.appendChild(outerPolygon);

        if (storagePercentage !== 0) {
            // Storage shape
            const innerPolygon = document.createElementNS(
                svg.namespaceURI,
                'polygon'
            );
            innerPolygon.setAttribute('fill', '#1c638e');
            innerPolygon.setAttribute(
                'points',
                `${innerUpperLeft.join(',')} ${innerUpperRight.join(
                    ','
                )} ${lowerRight.join(',')} ${lowerLeft.join(',')}`
            );
            innerPolygon.setAttribute('shape-rendering', 'geometricPrecision');

            svg.appendChild(innerPolygon);
        }

        const addLine = addLineConstructor(
            upperWidth,
            svg,
            calculateXPosition,
            calculateYPosition,
            scale
        );

        addLine('ninetieth-percentile-line', highPercentile, '#fff');
        addLine('average-line', average, '#d0a02a');
        addLine('tenth-percentile-line', lowPercentile, '#fff');

        return svg;
    }

    private drawSVG(
        svgElement: SVGElement,
        svgLayer: SVGSVGElement
    ): SVGSVGElement {
        svgLayer.appendChild(svgElement);

        return svgLayer;
    }

    private drawSVGAtPoint(
        map: Map,
        point: mapboxgl.LngLatLike,
        svgElement: SVGElement,
        svgLayer: SVGSVGElement
    ): SVGSVGElement {
        const pixel = map.project(point);
        svgElement.setAttribute('x', `${pixel.x}`);
        svgElement.setAttribute('cx', `${pixel.x}`);
        svgElement.setAttribute('y', `${pixel.y}`);
        svgElement.setAttribute('cy', `${pixel.y}`);
        svgLayer.appendChild(svgElement);

        return svgLayer;
    }

    private drawSVGAtPosition(
        position: { x: number; y: number },
        svgElement: SVGElement,
        svgLayer: SVGSVGElement
    ): SVGSVGElement {
        const { x, y } = position;

        svgElement.setAttribute('transform', `translate(${x}, ${y})`);

        svgLayer.appendChild(svgElement);

        return svgLayer;
    }

    private repostion(
        position: { x: number; y: number },
        svgElement: SVGElement
    ): void {
        const { x, y } = position;

        svgElement.setAttribute('transform', `translate(${x}, ${y})`);
    }

    private getLegend(map: Map): { id: string; w: number; h: number } {
        if (
            map.getLayer(LayerId.USDroughtMonitor) &&
            map.getLayoutProperty(LayerId.USDroughtMonitor, 'visibility') ===
                'visible'
        ) {
            return { id: 'drought-legend', w: 293, h: 371 };
        }
        if (
            map.getLayer(LayerId.NOAAPrecipSixToTen) &&
            map.getLayoutProperty(LayerId.NOAAPrecipSixToTen, 'visibility') ===
                'visible'
        ) {
            return { id: 'precip-legend', w: 293, h: 371 };
        }
        if (
            map.getLayer(LayerId.NOAATempSixToTen) &&
            map.getLayoutProperty(LayerId.NOAATempSixToTen, 'visibility') ===
                'visible'
        ) {
            return { id: 'temp-legend', w: 293, h: 371 };
        }
        return { id: 'none-legend', w: 293, h: 228 };
    }

    private formatDate(date: string | null) {
        const day = date && dayjs(date).isValid() ? dayjs(date) : dayjs();

        return day.format('MMMM D, YYYY');
    }

    private drawDate(
        date: string,
        context: OffscreenCanvasRenderingContext2D,
        legendPosition: { x: number; y: number }, // TODO: define this type
        legendWidth: number
    ) {
        const { x: legendX, y: legendY } = legendPosition;

        const x = legendX + legendWidth - 150;
        const y = legendY + 55;

        context.font = '12px sans-serif';
        context.fillStyle = '#FFF';
        context.fillText(date, x, y);
    }

    private drawScale(
        map: Map,
        context: OffscreenCanvasRenderingContext2D,
        legendPosition: { x: number; y: number },
        legendWidth: number,
        legendHeight: number
    ) {
        // Get scale HTML element
        const scaleElement = map
            .getContainer()
            .querySelector('.mapboxgl-ctrl-scale');

        // No-op if scale HTML element is missing
        if (!scaleElement) {
            // eslint-disable-next-line no-console
            console.error('Failed to add map scale');
            return;
        }

        const scaleWidth = scaleElement.clientWidth;
        const scaleLabel = scaleElement.textContent;

        const scaleOffsetY = 15;
        const labelOffset = 15;

        const minX = legendPosition.x + legendWidth / 2 - scaleWidth / 2;
        const maxX = minX + scaleWidth;
        const midX = (minX + maxX) / 2;

        const midY = legendPosition.y + legendHeight - scaleOffsetY;

        const tickHeight = 5;

        context.strokeStyle = '#000';
        context.lineWidth = 2;

        // Draw lines
        context.beginPath();
        context.moveTo(minX, midY);
        context.lineTo(maxX, midY);

        context.moveTo(minX, midY - tickHeight);
        context.lineTo(minX, midY + tickHeight);

        context.moveTo(maxX, midY - tickHeight);
        context.lineTo(maxX, midY + tickHeight);

        context.stroke();

        // Draw label
        context.font = '10px sans-serif';
        context.fillStyle = '#000';
        context.textAlign = 'center';
        context.textBaseline = 'top';

        if (scaleLabel) {
            context.fillText(scaleLabel, midX, midY - labelOffset);
        }
    }

    private exportCombinedImage(
        map: Map,
        svgOverlay: SVGSVGElement,
        date: string | null,
        callback?: (response: TCallbackResponse) => void
    ) {
        const mapCanvas = map.getCanvas();
        const devicePixelRatio = this.getDevicePixelRatio();

        const width = mapCanvas.width * devicePixelRatio;
        const height = mapCanvas.height * devicePixelRatio;

        const {
            id: legendId,
            w: legendWidth,
            h: legendHeight,
        } = this.getLegend(map);

        const reportLegend = document.getElementById(
            legendId
        ) as HTMLImageElement | null;

        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        // Draw map canvas
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.drawImage(mapCanvas, 0, 0, width, height);
        context.restore();

        // Serialize SVG and draw it on canvas
        const svgData = new XMLSerializer().serializeToString(svgOverlay);
        const svgBlob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            context.drawImage(img, 0, 0, width, height);
            const legendPosition = {
                x: width - legendWidth - 12,
                y: height - legendHeight - 12,
            };

            const formattedDate = this.formatDate(date);
            if (reportLegend) {
                context.drawImage(
                    reportLegend,
                    legendPosition.x,
                    legendPosition.y,
                    legendWidth,
                    legendHeight
                );

                this.drawDate(
                    formattedDate,
                    context,
                    legendPosition,
                    legendWidth
                );

                this.drawScale(
                    map,
                    context,
                    legendPosition,
                    legendWidth,
                    legendHeight
                );
            }
            URL.revokeObjectURL(url);

            canvas
                .convertToBlob()
                .then((blob) => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `Reservoir Conditions Report - ${formattedDate}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    if (callback) {
                        callback({
                            success: true,
                            message: 'Report generated successfully.',
                        });
                    }
                    return blob;
                })
                .catch((error) => {
                    console.error('Issue creating report: ', error);
                    if (callback) {
                        callback({
                            success: false,
                            message:
                                'Error encountered converting report to png.',
                        });
                    }
                });
        };
        img.src = url;
    }
}
