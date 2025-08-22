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
import { IdentifiableProperties } from './utils';

export class ReportService {
    private accessToken: string;
    private dataUrl: string | null = null;
    private svgLayer: SVGSVGElement | null = null;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    public report(
        map: Map,
        reservoirs: Feature<Point, IdentifiableProperties>[]
    ) {
        const [newMap, container] = this.duplicateMapInstance(map, [1600, 900]);

        newMap.once('load', () => {
            void this.handleReportDownload(newMap, container, reservoirs);
        });
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
        ctx.drawImage(mapCanvas, 0, 0);

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

    private async handleReportDownload(
        map: Map,
        container: HTMLDivElement,
        reservoirs: Feature<Point, IdentifiableProperties>[]
    ) {
        this.modifyLayers(map);
        let svgOverlay = this.addSVGLayer(container);
        const reservoirsInCircle = this.sortReservoirs(map, reservoirs);
        //const reservoir of reservoirsInCircle
        for (let i = 0; i < reservoirsInCircle.length; i++) {
            const reservoir = reservoirsInCircle[i];
            const config = getReservoirConfig(reservoir.properties.configId);
            if (config) {
                const reservoirSVG = this.createReservoirSVG(config, reservoir);

                console.log('reservoirSVG', reservoirSVG);

                const circle = this.createCircle();
                const point = reservoir.geometry.coordinates as [
                    number,
                    number
                ];

                svgOverlay = this.connectSVGToMapPoint(
                    map,
                    point,
                    svgOverlay,
                    i
                );

                svgOverlay = this.drawSVGAtPoint(
                    map,
                    point,
                    circle,
                    svgOverlay
                );

                svgOverlay = this.placeTeacupPolygon(
                    svgOverlay,
                    reservoirSVG,
                    i
                );
            }
        }

        // Wait for map to render
        await new Promise((resolve) => map.once('render', resolve));

        console.log('svgOverlay', svgOverlay);
        // Combine map canvas and SVG overlay
        this.exportCombinedImage(map, svgOverlay);
    }

    createReservoirSVG(
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

    drawSVGAtPoint(
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

    public connectSVGToMapPoint(
        map: Map,
        point: mapboxgl.LngLatLike,
        svgLayer: SVGSVGElement,
        index: number
    ): SVGSVGElement {
        const pixel = map.project(point);

        const line = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
        );

        const reservoirPoint = positions[index];

        line.setAttribute('x1', `${reservoirPoint.x}`);
        line.setAttribute('y1', `${reservoirPoint.y}`);
        line.setAttribute('x2', `${pixel.x}`);
        line.setAttribute('y2', `${pixel.y}`);
        line.setAttribute('stroke', 'black');
        svgLayer.appendChild(line);

        return svgLayer;
    }

    duplicateMapInstance(
        originalMap: Map,
        aspectRatio: [number, number]
    ): [Map, HTMLDivElement] {
        const container = document.createElement('div');
        container.style.width = `${aspectRatio[0]}px`;
        container.style.height = `${aspectRatio[1]}px`;
        container.style.maxWidth = `${aspectRatio[0]}px`;
        container.style.maxHeight = `${aspectRatio[1]}px`;
        document.body.appendChild(container);

        const center = originalMap.getCenter();

        const zoom = originalMap.getZoom();

        // Approximate degrees per km at the equator
        const degreesPerKm = 1 / 111;

        // Max shift at zoom level 0 (e.g., 200 km), scaled down as zoom increases
        const maxKmShift = 200;
        const kmShift = maxKmShift / Math.pow(zoom, 1.5); // You can tweak the exponent for sensitivity
        const latShift = kmShift * degreesPerKm;

        const shiftedCenter = {
            lng: center.lng,
            lat: center.lat + latShift,
        };

        const newMap = new Map({
            container: container,
            style: originalMap.getStyle(),
            center: shiftedCenter,
            zoom: originalMap.getZoom(),
            bearing: originalMap.getBearing(),
            pitch: originalMap.getPitch(),
            projection: originalMap.getProjection(),
            accessToken: this.accessToken,
        });

        return [newMap, container];
    }

    sortReservoirs<T extends GeoJsonProperties>(
        map: Map,
        reservoirs: Feature<Point, T>[]
    ): Feature<Point, T>[] {
        const TWO_PI = Math.PI * 2;

        // Internal working type including derived fields
        type Projected = {
            res: Feature<Point, T>;
            x: number;
            y: number;
            theta: number; // angle around centroid, CCW, 0 = East
            absDy: number; // |y - cy|, i.e., "how centered between north and south"
            r: number; // distance to centroid, for stable tiebreaks
        };

        // 1) Project features to screen space once
        const pts: Projected[] = reservoirs.map((res) => {
            const [lng, lat] = res.geometry.coordinates as [number, number];
            const { x, y } = map.project([lng, lat]) as unknown as {
                x: number;
                y: number;
            };
            return { res, x, y, theta: 0, absDy: 0, r: 0 };
        });

        // 2) Screen-space centroid
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

        // 3) Angles in math coords (flip Y so CCW increases correctly)
        for (const p of pts) {
            const dx = p.x - cx;
            const dyMath = cy - p.y; // flip Y: screen Y grows down, math Y grows up
            let theta = Math.atan2(dyMath, dx); // [-π, π]
            if (theta < 0) theta += TWO_PI; // [0, 2π)
            p.theta = theta;
            p.absDy = Math.abs(p.y - cy);
            p.r = Math.hypot(dx, p.y - cy);
        }

        // 4) Choose start point:
        //    - Most centered vertically (min |y - cy|)
        //    - Tiebreaker: prefer the one on the East side (x - cx >= 0)
        pts.sort((a, b) => {
            if (a.absDy !== b.absDy) return a.absDy - b.absDy;

            const ax = a.x - cx;
            const bx = b.x - cx;

            // Prefer east side over west if only one is east
            if (ax >= 0 !== bx >= 0) return ax >= 0 ? -1 : 1;

            // Next tiebreaker: farther east
            if (ax !== bx) return bx - ax;

            // Finally: closer to centroid
            if (a.r !== b.r) return a.r - b.r;
            return 0;
        });

        const theta0 = pts[0].theta;

        // 5) Sort CCW starting from theta0
        pts.sort((a, b) => {
            const da = (a.theta - theta0 + TWO_PI) % TWO_PI;
            const db = (b.theta - theta0 + TWO_PI) % TWO_PI;

            if (da !== db) return da - db;

            // Stable tiebreakers: nearer to centroid; then east; then north
            if (a.r !== b.r) return a.r - b.r;

            const ax = a.x - cx,
                ay = a.y - cy;
            const bx = b.x - cx,
                by = b.y - cy;
            if (ax !== bx) return bx - ax; // prefer east
            return ay - by; // then north (smaller y)
        });

        return pts.map((p) => p.res);
    }

    // sortReservoirs<T extends GeoJsonProperties>(
    //     map: Map,
    //     reservoirs: Feature<Point, T>[]
    // ): Feature<Point, T>[] {
    //     // Calculate centroid in screen space
    //     const cx =
    //         reservoirs.reduce(
    //             (sum, res) =>
    //                 sum +
    //                 map.project(res.geometry.coordinates as [number, number]).x,
    //             0
    //         ) / reservoirs.length;
    //     const cy =
    //         reservoirs.reduce(
    //             (sum, res) =>
    //                 sum +
    //                 map.project(res.geometry.coordinates as [number, number]).y,
    //             0
    //         ) / reservoirs.length;

    //     // Sort counter-clockwise starting from east
    //     return reservoirs.sort((resA, resB) => {
    //         const projectedA = map.project(
    //             resA.geometry.coordinates as [number, number]
    //         );
    //         const projectedB = map.project(
    //             resB.geometry.coordinates as [number, number]
    //         );

    //         const angleA = Math.atan2(projectedA.y - cy, projectedA.x - cx);
    //         const angleB = Math.atan2(projectedB.y - cy, projectedB.x - cx);

    //         // Convert angles to start from east and go counter-clockwise
    //         const adjustedA =
    //             (Math.PI * 2 + Math.PI / 2 - angleA) % (Math.PI * 2);
    //         const adjustedB =
    //             (Math.PI * 2 + Math.PI / 2 - angleB) % (Math.PI * 2);

    //         return adjustedA - adjustedB;
    //     });
    // }

    createMapImage(map: Map): Promise<Blob | null> {
        return new Promise(function (resolve) {
            map.once('render', function () {
                const canvas = map.getCanvas();
                const newCanvas = document.createElement('canvas');
                newCanvas.width = 1600;
                newCanvas.height = 900;
                const context = newCanvas.getContext('2d');
                if (context) {
                    context.drawImage(
                        canvas,
                        0,
                        0,
                        newCanvas.width,
                        newCanvas.height
                    );
                    newCanvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        }
                    });
                }
            });
            /* trigger render */
            map.setBearing(map.getBearing());
        });
    }

    createCircle(): SVGCircleElement {
        const circle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
        );

        circle.setAttribute('stroke', `#000`);

        circle.setAttribute('stroke-width', `3`);

        circle.setAttribute('fill', `#fff`);

        circle.setAttribute('r', '10');

        return circle;
    }

    placeTeacupPolygon(
        overlay: SVGSVGElement,
        teacup: SVGSVGElement,
        index: number
    ): SVGSVGElement {
        const { x, y } = positions[index];

        teacup.setAttribute('transform', `translate(${x}, ${y})`);

        overlay.appendChild(teacup);

        return overlay;
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
