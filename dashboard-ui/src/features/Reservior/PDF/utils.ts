import { Dispatch, SetStateAction } from 'react';
import { LngLatLike, Map } from 'mapbox-gl';
import { loadTeacups as loadImages } from '@/features/Map/utils';
import { Chart as ChartJS } from 'chart.js';

/**
 * Creates an image from the current state of the Mapbox map.
 *
 * @function
 * @param {Map} map - The Mapbox map instance.
 * @returns {Promise<Blob | null>} - A promise that resolves to a Blob representing the map image, or null if the image creation fails.
 */
const createMapImage = (map: Map): Promise<Blob | null> => {
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
): Map => {
    const container = document.createElement('div');
    container.style.width = `${aspectRatio[0]}px`;
    container.style.height = `${aspectRatio[1]}px`;
    container.style.maxWidth = `${aspectRatio[0]}px`;
    container.style.maxHeight = `${aspectRatio[1]}px`;

    const newMap = new Map({
        container: container,
        style: originalMap.getStyle(),
        center: center,
        zoom: originalMap.getZoom(),
        bearing: originalMap.getBearing(),
        pitch: originalMap.getPitch(),
        accessToken: accessToken,
    });

    return newMap;
};

/**
 * After the new map loads, create the map image and update the state of the calling component.
 *
 * @function
 * @param {Map} map - The Mapbox map instance.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<Blob | null>>} setMapImage - A state setter function for the map image.
 * @param {Dispatch<SetStateAction<boolean>>} setLoading - A state setter function for the loading state.
 */
const handleMapLoad = async (
    map: Map,
    cancel: boolean,
    setMapImage: Dispatch<SetStateAction<Blob | null>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    const data = await createMapImage(map);
    if (!cancel) {
        setMapImage(data);
        setLoading(false);
        // Delete new map instance
        map.remove();
    }
};

/**
 * Creates an image from a Mapbox map instance.
 *
 * @function
 * @param {Map} map - The original Mapbox map instance.
 * @param {LngLatLike} center - The center coordinates for the new map.
 * @param {string} accessToken - The Mapbox access token.
 * @param {boolean} cancel - A flag indicating the calling component has unmounted.
 * @param {Dispatch<SetStateAction<Blob | null>>} setMapImage - A state setter function for the map image.
 * @param {Dispatch<SetStateAction<boolean>>} setLoading - A state setter function for the loading state.
 */
export const handleCreateMapImage = (
    map: Map,
    center: LngLatLike,
    accessToken: string,
    cancel: boolean,
    setMapImage: Dispatch<SetStateAction<Blob | null>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    const newMap = duplicateMapInstance(map, center, accessToken, [1600, 900]);
    loadImages(newMap);
    newMap.once('load', () => {
        void handleMapLoad(newMap, cancel, setMapImage, setLoading);
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
 * @param {Dispatch<SetStateAction<boolean>>} setLoading - A state setter function for the loading state.
 */
export const handleCreateChartImage = (
    chart: ChartJS<'line', Array<{ x: string; y: number }>>,
    cancel: boolean,
    setChartImage: Dispatch<SetStateAction<Blob | null>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    const { newChart, container } = duplicateChartInstance(chart, [616, 271]);

    const animationTimeout = setTimeout(() => {
        void (async () => {
            const data = await createChartImage(newChart);
            if (!cancel) {
                setChartImage(data);
                setLoading(false);
                // Remove container and extra chart instance
                newChart.destroy();
                container.remove();
            }
        })();
    }, 1000);

    return () => clearTimeout(animationTimeout);
};
