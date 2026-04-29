/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    LayerId,
    ReservoirConfigs,
    SourceId,
    SubLayerId,
} from '@/features/Map/consts';
import { ReservoirConfig } from '@/features/Map/types';
import { getReservoirConfig } from '@/features/Map/utils';
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

export class ReportService {
    public async report(
        map: Map,
        reservoirs: Feature<Point, OrganizedProperties>[],
        container: HTMLDivElement
    ) {
        this.positionView(map, reservoirs);
        this.modifyLayers(map);
        let svgOverlay = this.addSVGLayer(container);
        svgOverlay.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgOverlay.setAttribute('font', '"Geist", "Geist Fallback"');

        // const reservoirsInCircle = this.sortReservoirs(map, reservoirs);
        //const reservoir of reservoirsInCircle
        for (let i = 0; i < reservoirs.length; i++) {
            const reservoir = reservoirs[i];
            const config = getReservoirConfig(
                reservoir.properties.sourceId as SourceId
            );
            if (config) {
                const mapPositionCircle = this.createCircle(i);
                const point = reservoir.geometry.coordinates as [
                    number,
                    number,
                ];

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    mapPositionCircle,
                    svgOverlay
                );

                const mapTag = this.createTag(i);

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    mapTag,
                    svgOverlay
                );

                const position = RESERVOIR_POSITIONS[i];

                const reservoirSVG = this.createReservoirSVG(config, reservoir);
                svgOverlay = this.drawSVGAtPosition(
                    position,
                    reservoirSVG,
                    svgOverlay
                );

                const infoSVG = this.createInfoBox(config, reservoir);

                // Draw this svg, then calculate the width in the dom to reposition
                svgOverlay = this.drawSVG(infoSVG, svgOverlay);

                const { width: infoBoxWidth } = infoSVG.getBoundingClientRect();

                const infoBoxPosition = {
                    x: position.x - Math.abs(160 - infoBoxWidth) / 2,
                    y:
                        position.y +
                        (Number(reservoirSVG.getAttribute('height')) ?? 0),
                };

                this.repostion(infoBoxPosition, infoSVG);

                const indicatorCircle = this.createCircle(i);
                const indicatorPosition = {
                    x: position.x - Math.abs(160 - infoBoxWidth) / 2 - 2, // position at bottom left corner
                    y:
                        position.y +
                        (Number(reservoirSVG.getAttribute('height')) ?? 0) -
                        2,
                };

                svgOverlay = this.drawSVGAtPosition(
                    indicatorPosition,
                    indicatorCircle,
                    svgOverlay
                );

                const infoTag = this.createTag(i);

                svgOverlay = this.drawSVGAtPosition(
                    indicatorPosition,
                    infoTag,
                    svgOverlay
                );
            }
        }

        // Wait for map to render
        map.setBearing(map.getBearing());
        await new Promise((resolve) => map.once('render', resolve));
        await new Promise(requestAnimationFrame);

        // Combine map canvas and SVG overlay
        this.exportCombinedImage(map, svgOverlay);
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
                    top: 250,
                    left: 210,
                    right: 210,
                    bottom: 250,
                },
                maxZoom: 16,
                duration: 0,
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
        ReservoirConfigs.forEach((config) => {
            [config.iconLayer, config.labelLayer].forEach((layerId) => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', 'none');
                }
            });
        });
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

        const color = TAG_COLORS[index];

        circle.setAttribute('stroke', `#000`);

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

        tag.setAttribute('text-anchor', 'middle');
        tag.setAttribute('dominant-baseline', 'middle');
        tag.setAttribute('fill', '#000');
        tag.setAttribute('font-size', '14');
        tag.setAttribute('font-weight', 'bold');
        tag.setAttribute('font-family', 'sans-serif');

        // tag.setAttribute('dx', '-3');
        // tag.setAttribute('dy', '3');

        return tag;
    }

    private breakLines(text: string): string[] {
        const lines = [];
        let line = '';

        for (const word of text.split(' ')) {
            line += word + ' ';

            if (line.length > 16) {
                lines.push(line);
                line = '';
            }
        }

        if (lines.length === 0) {
            return [text];
        }

        if (line.length > 0) {
            lines.push(line);
        }

        return lines;
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

        requestAnimationFrame(() => {
            const bbox = g.getBBox();

            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect'
            );

            const width = Math.min(bbox.width + 16, 200);
            rect.setAttribute('x', `${bbox.x - 8}`);
            rect.setAttribute('y', `${bbox.y - 8}`);
            rect.setAttribute('width', `${width}`);
            rect.setAttribute('height', `${bbox.height + 16}`);
            rect.setAttribute('fill', '#fff');
            rect.setAttribute('rx', '6');
            rect.setAttribute('ry', '6');

            svg.insertBefore(rect, g);

            svg.setAttribute('width', `${width}`);
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

    private exportCombinedImage(map: Map, svgOverlay: SVGSVGElement) {
        const mapCanvas = map.getCanvas();
        const width = mapCanvas.width;
        const height = mapCanvas.height;

        const {
            id: legendId,
            w: legendWidth,
            h: legendHeight,
        } = this.getLegend(map);

        const reportLegend = document.getElementById(
            legendId
        ) as HTMLImageElement | null;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        // Draw map canvas
        context.save();
        context.globalCompositeOperation = 'source-over';
        context.drawImage(mapCanvas, 0, 0);
        context.restore();

        if (reportLegend) {
            context.drawImage(
                reportLegend,
                1297,
                519,
                legendWidth,
                legendHeight
            );
        }

        // Serialize SVG and draw it on canvas
        const svgData = new XMLSerializer().serializeToString(svgOverlay);
        const svgBlob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            context.drawImage(img, 0, 0);
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
