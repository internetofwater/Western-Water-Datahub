import { MapMouseEvent, Map, Point, LngLat } from 'mapbox-gl';
import { GeoJSONFeature } from 'mapbox-gl';

let zoom = 0;

const mapMock = {
    on: jest.fn((event, callback) => {
        if (event === 'load') {
            callback();
        } else if (event === 'zoom') {
            callback();
        }
    }),
    remove: jest.fn(),
    addLayer: jest.fn(),
    addSource: jest.fn(),
    getSource: jest.fn(),
    getLayer: jest.fn(),
    setLayerZoomRange: jest.fn(),
    setPaintProperty: jest.fn(),
    setLayoutProperty: jest.fn(),
    setFilter: jest.fn(),
    setCenter: jest.fn(),
    getZoom: jest.fn(() => zoom),
    setZoom: jest.fn((newZoom) => {
        zoom = newZoom;
    }),
    addControl: jest.fn(),
    flyTo: jest.fn(),
    fitBounds: jest.fn(),
    emit: jest.fn(),
    getCanvas: jest.fn(() => ({
        style: {
            cursor: '',
        },
    })),
};

const popupMock = {
    setLngLat: jest.fn().mockReturnThis(),
    setHtml: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
};

const mapboxglMock = {
    Map: jest.fn(() => mapMock),
    NavigationControl: jest.fn(),
    GeolocateControl: jest.fn(),
    ScaleControl: jest.fn(),
    AttributionControl: jest.fn(),
    FullscreenControl: jest.fn(),
    Marker: jest.fn(() => ({
        setLngLat: jest.fn().mockReturnThis(),
        addTo: jest.fn().mockReturnThis(),
        remove: jest.fn(),
    })),
    Popup: jest.fn(() => popupMock),
    MouseEvent: jest.fn(),
};

export const createFakeMapMouseEvent = (
    type: string,
    map: Map,
    originalEvent: MouseEvent,
    features: GeoJSONFeature[] = []
): MapMouseEvent => {
    return {
        type,
        target: map,
        originalEvent,
        point: new Point(100, 200),
        lngLat: new LngLat(-122.4194, 37.7749),
        features,
        preventDefault: jest.fn(),
        get defaultPrevented() {
            return this._defaultPrevented;
        },
        _defaultPrevented: false,
    } as MapMouseEvent;
};

export default mapboxglMock;
