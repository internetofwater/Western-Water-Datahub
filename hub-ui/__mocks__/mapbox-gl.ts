/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeoJSONFeature, LngLat, Map, MapMouseEvent, Point } from 'mapbox-gl';
import { vi } from 'vitest';

console.log('mapbox-gl mock loaded');

let zoom = 0;

const mapEvents = [
  'load',
  'idle',
  'render',
  'resize',
  'remove',
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'mousemove',
  'mouseover',
  'mouseout',
  'mouseenter',
  'mouseleave',
  'touchstart',
  'touchend',
  'touchmove',
  'contextmenu',
  'wheel',
  'boxzoomstart',
  'boxzoomend',
  'boxzoomcancel',
  'dragstart',
  'dragend',
  'drag',
  'zoomstart',
  'zoomend',
  'rotatestart',
  'rotateend',
  'pitchstart',
  'pitchend',
];

const mapMock = {
  // on/once can include the layer id or not
  on: vi.fn((event, ...args) => {
    if (mapEvents.includes(event)) {
      const callback = args.length === 2 ? args[1] : args[0];
      callback();
    }
  }),
  once: vi.fn((event, ...args) => {
    if (mapEvents.includes(event)) {
      const callback = args.length === 2 ? args[1] : args[0];
      callback();
    }
  }),

  remove: vi.fn(),
  addLayer: vi.fn(),
  addSource: vi.fn(),
  getSource: vi.fn(),
  getLayer: vi.fn(),
  setLayerZoomRange: vi.fn(),
  setPaintProperty: vi.fn(),
  setLayoutProperty: vi.fn(),
  setFilter: vi.fn(),
  setCenter: vi.fn(),
  getZoom: vi.fn(() => zoom),
  setZoom: vi.fn((newZoom) => {
    zoom = newZoom;
  }),
  addControl: vi.fn(),
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  emit: vi.fn(),
  getCanvas: vi.fn(() => ({
    style: {
      cursor: '',
    },
  })),
};

const popupMock = {
  setLngLat: vi.fn().mockReturnThis(),
  setHtml: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
};

const mapboxglMock = {
  Map: vi.fn(() => mapMock),
  NavigationControl: vi.fn(),
  GeolocateControl: vi.fn(),
  ScaleControl: vi.fn(),
  AttributionControl: vi.fn(),
  FullscreenControl: vi.fn(),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  Popup: vi.fn(() => popupMock),
  MouseEvent: vi.fn(),
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
    preventDefault: vi.fn(),
    get defaultPrevented() {
      return this._defaultPrevented;
    },
    _defaultPrevented: false,
  } as MapMouseEvent;
};

export default mapboxglMock;
