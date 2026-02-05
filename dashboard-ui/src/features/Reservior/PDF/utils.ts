/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { createElement, Dispatch, RefObject, SetStateAction } from 'react';
import { LngLatLike, Map } from 'mapbox-gl';
import { loadImages as loadImages } from '@/features/Map/utils';
import { Chart as ChartJS } from 'chart.js';
import { createRoot } from 'react-dom/client';
import { Graphic } from '@/features/Reservior/TeacupDiagram/Graphic';
import { GeoJsonProperties } from 'geojson';
import { ReservoirConfig } from '@/features/Map/types';

/**
 * Creates an image from the current state of the Mapbox map.
 *
 * @function
 * @param {Map} map - The Mapbox map instance.
 * @returns {Promise<Blob | null>} - A promise that resolves to a Blob representing the map image, or null if the image creation fails.
 */
const createMapImage = <T extends boolean>(
    map: Map,
    width: number,
    height: number,
    toBlob: T
): Promise<T extends true ? Blob | null : string> => {
    return new Promise((resolve) => {
        map.once('render', () => {
            const canvas = map.getCanvas();

            const newCanvas = document.createElement('canvas');
            newCanvas.width = width;
            newCanvas.height = height;
            const context = newCanvas.getContext('2d');
            if (context) {
                context.drawImage(
                    canvas,
                    0,
                    0,
                    newCanvas.width,
                    newCanvas.height
                );
                if (toBlob) {
                    newCanvas.toBlob((blob) => {
                        resolve(blob as T extends true ? Blob | null : string);
                    });
                } else {
                    resolve(
                        newCanvas.toDataURL() as T extends true
                            ? Blob | null
                            : string
                    );
                }
            } else {
                resolve(null as T extends true ? Blob | null : string);
            }
        });
        map.setBearing(map.getBearing()); // trigger render
    });
};

/**
 * Duplicates a Mapbox map instance with a specified center and aspect ratio.
 *
 * @function
 * @param {Map} originalMap - The original Mapbox map instance.
 * @param {LngLatLike} center - The center coordinates for the new map.
 * @param {string} accessToken - The Mapbox access token.
 * @param {[number, number]} aspectRatio - The aspect ratio for the new map container.
 * @returns {Map} - The new Mapbox map instance.
 */
const duplicateMapInstance = (
    originalMap: Map,
    center: LngLatLike,
    accessToken: string,
    aspectRatio: [number, number]
): { map: Map; container: HTMLDivElement } => {
    const container = document.createElement('div');
    container.style.width = `${aspectRatio[0]}px`;
    container.style.height = `${aspectRatio[1]}px`;
    document.body.appendChild(container);
    const newMap = new Map({
        accessToken,
        container,
        center,
        style: originalMap.getStyle(),
        zoom: originalMap.getZoom(),
        bearing: originalMap.getBearing(),
        pitch: originalMap.getPitch(),
    });
    return { map: newMap, container };
};

/**
 * After the new map loads, create the map image and update the state of the calling component.
 *
 * @function
 * @param {Map} map - The Mapbox map instance.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<Blob | null>>} setMapImage - A state setter function for the map image.
 */
const handleMapLoad = <T extends boolean>(
    map: Map,
    container: HTMLDivElement,
    width: number,
    height: number,
    toBlob: T,
    updateMapImage: (src: T extends true ? Blob | null : string) => void,
    updateLoading: (loading: boolean) => void
): void => {
    void createMapImage(map, width, height, toBlob).then((data) => {
        updateMapImage(data as T extends true ? Blob | null : string);

        map.remove(); // removes WebGL + listeners
        container.remove(); // removes DOM node → prevents memory leak
        updateLoading(false);
    });
};

/**
 * Creates an image from a Mapbox map instance.
 *
 * @function
 * @param {Map} map - The original Mapbox map instance.
 * @param {LngLatLike} center - The center coordinates for the new map.
 * @param {string} accessToken - The Mapbox access token.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<T | null>>} setMapImage - A state setter function for the map image.
 */
export const handleCreateMapImage = <T extends boolean>(
    map: Map,
    center: LngLatLike,
    accessToken: string,
    width: number,
    height: number,
    toBlob: T,
    updateMapImage: (src: T extends true ? Blob | null : string) => void,
    updateLoading: (loading: boolean) => void
): void => {
    const { map: newMap, container } = duplicateMapInstance(
        map,
        center,
        accessToken,
        [width, height]
    );
    loadImages(newMap);
    newMap.once('load', () => {
        handleMapLoad(
            newMap,
            container,
            width,
            height,
            toBlob,
            updateMapImage,
            updateLoading
        );
    });
};

/**
 * Creates an image from a Chart.js chart instance.
 *
 * @function
 * @param {ChartJS<'line', Array<{ x: string; y: number }>>} chart - The Chart.js chart instance.
 * @returns {Promise<Blob | null>} - A promise that resolves to a Blob representing the chart image, or null if the image creation fails.
 */
const createChartImage = (
    chart: ChartJS<'line', Array<{ x: string; y: number }>>
): Promise<Blob | null> => {
    return new Promise(function (resolve) {
        const canvas = chart.canvas;
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            }
        });
    });
};

/**
 * Duplicates a Chart.js chart instance with a specified aspect ratio.
 *
 * @function
 * @param {ChartJS<'line', Array<{ x: string; y: number }>>} originalChart - The original Chart.js chart instance.
 * @param {[number, number]} aspectRatio - The aspect ratio for the new chart container.
 * @returns {{ newChart: ChartJS<'line', Array<{ x: string; y: number }>>, container: HTMLDivElement }} - The new Chart.js chart instance and its container.
 */
const duplicateChartInstance = (
    originalChart: ChartJS<'line', Array<{ x: string; y: number }>>,
    aspectRatio: [number, number]
): {
    newChart: ChartJS<'line', Array<{ x: string; y: number }>>;
    container: HTMLDivElement;
} => {
    const container = document.createElement('div');
    container.style.width = `${aspectRatio[0]}px`;
    container.style.height = `${aspectRatio[1]}px`;
    container.style.maxWidth = `${aspectRatio[0]}px`;
    container.style.maxHeight = `${aspectRatio[1]}px`;
    container.style.visibility = 'hidden';
    container.style.position = 'fixed';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    document.body.appendChild(container);

    const newChart = new ChartJS(canvas, originalChart.config);

    // TODO: these alterations are not working as expected, resolve to speed up conversion to image
    // newChart.options.animation = false;
    newChart.config.data.datasets.forEach((dataset) => {
        dataset.animation = false;
    });
    newChart.update();

    return { newChart, container };
};

/**
 * Creates an image from a Chart.js chart instance.
 *
 * @function
 * @param {ChartJS<'line', Array<{ x: string; y: number }>>} chart - The original Chart.js chart instance.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<Blob | null>>} setChartImage - A state setter function for the chart image.
 */
export const handleCreateChartImage = (
    chart: ChartJS<'line', Array<{ x: string; y: number }>>,
    cancel: boolean,
    setChartImage: Dispatch<SetStateAction<Blob | null>>
) => {
    const { newChart, container } = duplicateChartInstance(chart, [616, 271]);

    const animationTimeout = setTimeout(() => {
        void (async () => {
            const data = await createChartImage(newChart);
            if (!cancel) {
                setChartImage(data);
                // Remove container and extra chart instance
                newChart.destroy();
                container.remove();
            }
        })();
    }, 1000);

    return () => clearTimeout(animationTimeout);
};

/**
 * Creates an image from a svg then draws it onto a canvas to convert it to a react-pdf friendly png blob
 *
 * @function
 * @param {SVGSVGElement} svgElement - The diagram svg.
 * @param {[number, number]} aspectRatio - The aspect ratio for the new diagram container.
 */
const svgToBlob = (
    svgElement: SVGSVGElement,
    aspectRatio: [number, number]
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = aspectRatio[0];
            canvas.height = aspectRatio[1];
            const context = canvas.getContext('2d');
            if (!context) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            context.drawImage(img, 0, 0, aspectRatio[0], aspectRatio[1]);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        img.onerror = reject;
        img.src = url;
    });
};

/**
 * Renders a teacup diagram with all labels turned on and saves it as a png blob
 *
 * @function
 * @param {GeoJsonProperties} reservoirProperties - Properties of the currently selected reservoir feature.
 * @param {ReservoirConfig} config - Defines the property keys of the reservoir feature to use for creating the diagram.
 * @param {RefObject<SVGSVGElement | null>} graphicRef - Ref object used to hold the diagram svg.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<Blob | null>>} setDiagramImage - A state setter function for the diagram image.
 */
export const handleCreateDiagramImage = (
    reservoirProperties: GeoJsonProperties,
    config: ReservoirConfig,
    graphicRef: RefObject<SVGSVGElement | null>,
    cancel: boolean,
    setDiagramImage: Dispatch<SetStateAction<Blob | null>>
) => {
    const container = document.createElement('div');
    container.style.visibility = 'hidden';
    container.style.position = 'fixed';

    const root = createRoot(container);

    const cleanup = () => {
        setTimeout(() => {
            root.unmount();
            container.remove();
        }, 0);
    };
    let createBlob = true;
    const handleRendered = () => {
        if (graphicRef.current && createBlob) {
            createBlob = false;
            svgToBlob(graphicRef.current, [450, 260])
                .then((blob) => {
                    if (!cancel) {
                        setDiagramImage(blob);
                        cleanup();
                    }
                })
                .catch((error) => console.error(error));
        }
    };

    const element = createElement(Graphic, {
        reservoirProperties,
        config,
        colorScheme: 'light',
        showLabels: true,
        listeners: false,
        graphicRef,
        svgRenderCallback: handleRendered,
    });

    root.render(element);
};
