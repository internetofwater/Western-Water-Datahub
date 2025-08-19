// MapCloneService.ts
import { ResvizReservoirProperties } from '@/features/Map/types/reservoir/resviz';
import { RiseReservoirProperties } from '@/features/Map/types/reservoir/rise';
import { Feature, Point } from 'geojson';
import mapboxgl from 'mapbox-gl';

export interface MapCloneOptions {
    containerId: string;
    aspectRatio: number; // e.g., 16/9
    center?: mapboxgl.LngLatLike;
    zoom?: number;
    style?: string;
}

export class MapCloneService {
    private originalMap: mapboxgl.Map;
    private clonedMap: mapboxgl.Map | null = null;
    private svgLayer: SVGSVGElement | null = null;

    constructor(originalMap: mapboxgl.Map) {
        this.originalMap = originalMap;
    }

    private addSVGLayer(container: HTMLElement): void {
        this.svgLayer = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        this.svgLayer.setAttribute('class', 'svg-overlay');
        this.svgLayer.style.position = 'absolute';
        this.svgLayer.style.top = '0';
        this.svgLayer.style.left = '0';
        this.svgLayer.style.width = '100%';
        this.svgLayer.style.height = '100%';
        container.appendChild(this.svgLayer);
    }

    public addReservoirsToMap(
        features: Feature<
            Point,
            RiseReservoirProperties | ResvizReservoirProperties
        >[]
    ): void {}

    public cloneMap(options: MapCloneOptions): void {
        const container = document.getElementById(options.containerId);
        if (!container) throw new Error('Container not found');

        container.style.aspectRatio = `${options.aspectRatio}`;
        container.innerHTML = ''; // Clear previous content

        this.clonedMap = new mapboxgl.Map({
            container: container,
            style: options.style || this.originalMap.getStyle(),
            center: options.center || this.originalMap.getCenter(),
            zoom: options.zoom || this.originalMap.getZoom(),
        });

        this.addSVGLayer(container);
    }

    public toggleLayerVisibility(layerId: string, visible: boolean): void {
        if (!this.clonedMap) return;
        this.clonedMap.setLayoutProperty(
            layerId,
            'visibility',
            visible ? 'visible' : 'none'
        );
    }

    public drawSVGAtPoint(
        point: mapboxgl.LngLatLike,
        svgElement: SVGElement
    ): void {
        if (!this.clonedMap || !this.svgLayer) return;

        const pixel = this.clonedMap.project(point);
        svgElement.setAttribute('x', `${pixel.x}`);
        svgElement.setAttribute('y', `${pixel.y}`);
        this.svgLayer.appendChild(svgElement);
    }

    public connectSVGToMapPoint(
        svgElement: SVGElement,
        point: mapboxgl.LngLatLike
    ): void {
        if (!this.clonedMap || !this.svgLayer) return;

        const pixel = this.clonedMap.project(point);
        const svgRect = svgElement.getBoundingClientRect();

        const line = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
        );
        line.setAttribute('x1', `${svgRect.left + svgRect.width / 2}`);
        line.setAttribute('y1', `${svgRect.top + svgRect.height / 2}`);
        line.setAttribute('x2', `${pixel.x}`);
        line.setAttribute('y2', `${pixel.y}`);
        line.setAttribute('stroke', 'black');
        this.svgLayer.appendChild(line);
    }
}
