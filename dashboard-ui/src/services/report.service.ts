/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerId, SubLayerId } from '@/features/Map/consts';
import { ReservoirConfig } from '@/features/Map/types';
import { getReservoirConfig } from '@/features/Map/utils';
import {
    addLineConstructor,
    calculateInnerTrapezoidHeight,
    calculateXPositionConstructor,
} from '@/features/Reservior/TeacupDiagram/utils';
import { Feature, GeoJsonProperties, Point } from 'geojson';
import { Map } from 'mapbox-gl';
import { IdentifiableProperties } from '@/services/report.utils';
import { center, featureCollection } from '@turf/turf';
import dayjs from 'dayjs';

export class ReportService {
    public async report(
        map: Map,
        reservoirs: Feature<Point, IdentifiableProperties>[],
        container: HTMLDivElement
    ) {
        this.positionView(map, reservoirs);
        this.modifyLayers(map);
        let svgOverlay = this.addSVGLayer(container);
        svgOverlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const reservoirsInCircle = this.sortReservoirs(map, reservoirs);
        //const reservoir of reservoirsInCircle
        for (let i = 0; i < reservoirsInCircle.length; i++) {
            const reservoir = reservoirsInCircle[i];
            const config = getReservoirConfig(reservoir.properties.configId);
            if (config) {
                const mapPositionCircle = this.createCircle(i);
                const point = reservoir.geometry.coordinates as [
                    number,
                    number
                ];

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    mapPositionCircle,
                    svgOverlay
                );

                const position = positions[i];

                const reservoirSVG = this.createReservoirSVG(config, reservoir);
                svgOverlay = this.drawSVGAtPosition(
                    position,
                    reservoirSVG,
                    svgOverlay
                );

                const infoSVG = this.createInfoBox(config, reservoir);
                const infoBoxPosition = {
                    x:
                        position.x +
                        (Number(reservoirSVG.getAttribute('width')) ?? 0) / 2, // position at bottom left corner
                    y:
                        position.y +
                        (Number(reservoirSVG.getAttribute('height')) ?? 0),
                };

                svgOverlay = this.drawSVGAtPosition(
                    infoBoxPosition,
                    infoSVG,
                    svgOverlay
                );

                const indicatorCircle = this.createCircle(i);
                const indicatorPosition = {
                    x: position.x + 45, // position at bottom left corner
                    y:
                        position.y +
                        (Number(reservoirSVG.getAttribute('height')) ?? 0),
                };

                svgOverlay = this.drawSVGAtPosition(
                    indicatorPosition,
                    indicatorCircle,
                    svgOverlay
                );
            }
        }

        // Wait for map to render
        await new Promise((resolve) => map.once('render', resolve));
        await new Promise(requestAnimationFrame);

        // Combine map canvas and SVG overlay
        this.exportCombinedImage(map, svgOverlay);
    }

    private positionView(
        map: Map,
        reservoirs: Feature<Point, IdentifiableProperties>[]
    ) {
        const collection = featureCollection(reservoirs);

        const _center = center(collection);

        const zoom = map.getZoom();

        // Approximate degrees per km at the equator
        const degreesPerKm = 1 / 111;

        // Max shift at zoom level  0 (e.g., 200 km), scaled down as zoom increases
        const maxKmShift = 200;
        const kmShift = maxKmShift / Math.pow(zoom, 1.5); // shift at this zoom level
        const latShift = kmShift * degreesPerKm;

        const shiftedCenter = {
            lng: _center.geometry.coordinates[0],
            lat: _center.geometry.coordinates[1] + latShift,
        };
        map.setCenter(shiftedCenter);
    }

    private modifyLayers(map: Map) {
        map.setLayoutProperty(SubLayerId.RegionsFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.RegionsBoundary, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.BasinsFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.BasinsBoundary, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.StatesFill, 'visibility', 'none');
        map.setLayoutProperty(SubLayerId.StatesBoundary, 'visibility', 'none');
        map.setLayoutProperty(
            LayerId.ResvizEDRReservoirs,
            'visibility',
            'none'
        );
        map.setLayoutProperty(
            SubLayerId.ResvizEDRReservoirLabels,
            'visibility',
            'none'
        );
        // Todo: add noaa, snotel, base layers
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

    private sortReservoirs<T extends GeoJsonProperties>(
        map: Map,
        reservoirs: Feature<Point, T>[]
    ): Feature<Point, T>[] {
        const TWO_PI = Math.PI * 2;

        type Projected = {
            res: Feature<Point, T>;
            x: number;
            y: number;
            theta: number; // Angle position around center point
            absDy: number; // Normalized position between top and bottom
            r: number; // Radius, distance to center point
        };

        // Project lat-lngs to x & y
        const pts: Projected[] = reservoirs.map((res) => {
            const [lng, lat] = res.geometry.coordinates;
            const { x, y } = map.project([lng, lat]);
            return { res, x, y, theta: 0, absDy: 0, r: 0 };
        });

        // Determine center point of provided points
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

        // This is a screen grid so top left corner is (0, 0)
        // Inverting the y allows us to interact with these coordinates
        // using more basic math
        for (const p of pts) {
            const dx = p.x - cx;
            const dyMath = cy - p.y; // Invert y
            let theta = Math.atan2(dyMath, dx);
            // tan(theta) = opposite(dyMath, dx)
            if (theta < 0) {
                theta += TWO_PI;
            }
            p.theta = theta;
            p.absDy = Math.abs(p.y - cy);
            p.r = Math.hypot(dx, p.y - cy);
        }

        // Locate east-most point that is closest to the center Y point
        pts.sort((a, b) => {
            if (a.absDy !== b.absDy) {
                return a.absDy - b.absDy;
            }

            const ax = a.x - cx;
            const bx = b.x - cx;

            if (ax >= 0 !== bx >= 0) {
                return ax >= 0 ? -1 : 1;
            }

            if (ax !== bx) {
                return bx - ax;
            }

            if (a.r !== b.r) {
                return a.r - b.r;
            }
            return 0;
        });

        const theta0 = pts[0].theta;

        // Sort points counter-clockwise starting from most centered/east-most point
        pts.sort((a, b) => {
            const da = (a.theta - theta0 + TWO_PI) % TWO_PI;
            const db = (b.theta - theta0 + TWO_PI) % TWO_PI;

            if (da !== db) {
                return da - db;
            }

            if (a.r !== b.r) {
                return a.r - b.r;
            }

            const ax = a.x - cx,
                ay = a.y - cy;
            const bx = b.x - cx,
                by = b.y - cy;
            // prefer east
            if (ax !== bx) {
                return bx - ax;
            }
            return ay - by; // then north (smaller y)
        });

        return pts.map((p) => p.res);
    }

    private createCircle(index: number): SVGCircleElement {
        const circle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
        );

        const color = colors[index];

        circle.setAttribute('stroke', `#000`);

        circle.setAttribute('stroke-width', `3`);

        circle.setAttribute('fill', color);

        circle.setAttribute('r', '10');

        return circle;
    }

    private createInfoBox(
        config: ReservoirConfig,
        reservoir: Feature<Point, GeoJsonProperties>
    ): SVGSVGElement {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );

        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        svg.setAttribute('fill', 'black');
        svg.setAttribute('font-size', '12');

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(g);

        const lines = [
            String(reservoir.properties![config.labelProperty]),
            `Storage: ${Number(
                reservoir.properties![config.storageProperty]
            ).toLocaleString('en-us')} / ${Number(
                reservoir.properties![config.capacityProperty]
            ).toLocaleString('en-us')} ac-ft`,
            `${Math.round(
                (Number(reservoir.properties![config.storageProperty]) /
                    Number(reservoir.properties![config.capacityProperty])) *
                    100
            )} % Full - ${Math.round(
                (Number(
                    reservoir.properties![config.thirtyYearAverageProperty]
                ) /
                    Number(reservoir.properties![config.capacityProperty])) *
                    100
            )}`,
            `Data as of ${dayjs(
                String(reservoir.properties![config.storageDateProperty])
            ).format('MMM DD, YYYY')}`,
        ];

        lines.forEach((text, i) => {
            const t = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'text'
            );
            t.textContent = text;
            t.setAttribute('x', '8');
            t.setAttribute('y', `${20 + i * 16}`);
            g.appendChild(t);
        });

        requestAnimationFrame(() => {
            const bbox = g.getBBox();

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect'
            );
            rect.setAttribute('x', `${bbox.x - 8}`);
            rect.setAttribute('y', `${bbox.y - 8}`);
            rect.setAttribute('width', `${bbox.width + 16}`);
            rect.setAttribute('height', `${bbox.height + 16}`);
            rect.setAttribute('fill', '#fff');
            rect.setAttribute('rx', '6');
            rect.setAttribute('ry', '6');

            svg.insertBefore(rect, g);

            svg.setAttribute('width', `${bbox.width + 16}`);
            svg.setAttribute('height', `${bbox.height + 16}`);
        });

        return svg;
    }

    private createReservoirSVG(
        config: ReservoirConfig,
        reservoir: Feature<Point, GeoJsonProperties>
    ): SVGSVGElement {
        const storagePercentage =
            Number(reservoir.properties![config.storageProperty]) /
            Number(reservoir.properties![config.capacityProperty]);

        const nintiethPercentage =
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

        const average = (height - height * averagePercentage) * scale;
        const tenthPercentile = (height - height * tenthPercentage) * scale;
        const ninetiethPercentile =
            (height - height * nintiethPercentage) * scale;

        const cutHeight = calculateInnerTrapezoidHeight(
            size,
            upperWidth,
            lowerWidth,
            height
        );

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
        svg.appendChild(outerPolygon);

        if (storagePercentage !== 0) {
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
            svg.appendChild(innerPolygon);
        }

        const addLine = addLineConstructor(
            upperWidth,
            svg,
            calculateXPosition,
            scale
        );

        addLine('ninetieth-percentile-line', ninetiethPercentile, '#fff');
        addLine('average-line', average, '#d0a02a');
        addLine('tenth-percentile-line', tenthPercentile, '#fff');

        return svg;
    }

    private drawSVGAtPoint(
        map: Map,
        point: mapboxgl.LngLatLike,
        svgElement: SVGElement,
        svgLayer: SVGSVGElement
    ): SVGSVGElement {
        const pixel = map.project(point);
        // svgElement.setAttribute('x', `${pixel.x}`);
        svgElement.setAttribute('cx', `${pixel.x}`);
        // svgElement.setAttribute('y', `${pixel.y}`);
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

    private exportCombinedImage(map: Map, svgOverlay: SVGSVGElement) {
        const mapCanvas = map.getCanvas();
        const width = mapCanvas.width;
        const height = mapCanvas.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw map canvas
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(mapCanvas, 0, 0);
        ctx.restore();

        // Serialize SVG and draw it on canvas
        const svgData = new XMLSerializer().serializeToString(svgOverlay);
        const svgBlob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'report.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }, 'image/png');
        };
        img.src = url;
    }
}

const positions = [
    // Right most
    { x: 1400, y: 450 },
    { x: 1400, y: 250 },
    // Top
    { x: 1300, y: 75 }, // Top Right
    { x: 1100, y: 50 },
    { x: 900, y: 50 },
    { x: 700, y: 50 },
    { x: 500, y: 50 },
    // left
    { x: 250, y: 75 }, // Top left
    { x: 100, y: 250 },
    { x: 100, y: 425 },
    { x: 100, y: 600 },

    // Bottom
    { x: 300, y: 750 },
    { x: 500, y: 750 },
    { x: 700, y: 750 },
    { x: 900, y: 750 },
];

const colors = [
    '#FAEB55',
    '#816EBA',
    '#7E55FA',
    '#A5A06F',
    '#6C677A',
    '#504E3F',
    '#5D5311',
    '#812663',
    '#521FCA',
    '#095D97',
    '#488CD6',
    '#78AF13',
    '#4F0B02',
    '#C54130',
    '#F872B3',
];
