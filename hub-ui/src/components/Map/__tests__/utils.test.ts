/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import FeatureService, { FeatureServiceOptions } from '@hansdo/mapbox-gl-arcgis-featureserver';
import mapboxglMock, { Map, Popup, SourceSpecification } from 'mapbox-gl';
import { vi } from 'vitest';
import { MainLayerDefinition, SourceConfig, Sources } from '@/components/Map/types';
import {
  addClickFunctions,
  addHoverFunctions,
  addLayers,
  addSources,
} from '@/components/Map/utils';

vi.mock('mapbox-gl');
vi.mock('@hansdo/mapbox-gl-arcgis-featureserver');

const renderMock = vi.fn();
const unmountMock = vi.fn();

const rootMock = {
  render: renderMock,
  unmount: unmountMock,
};

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => rootMock),
}));

describe('Map Component: utils', () => {
  let map: Map;
  let hoverPopup: Popup;
  let persistentPopup: Popup;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    map = new mapboxglMock.Map({
      container: document.createElement('div'),
      zoom: 1,
      fadeDuration: 0,
      center: [0, 0],
      testMode: true,
    });
    hoverPopup = new mapboxglMock.Popup();
    persistentPopup = new mapboxglMock.Popup();
    container = document.createElement('div');
  });

  test('addSources adds geojson sources to map', () => {
    const sourceConfigs: SourceConfig[] = [
      {
        id: 'source1',
        type: Sources.GeoJSON,
        definition: {} as SourceSpecification,
      },
    ];

    addSources(map, sourceConfigs, () => {});
    expect(map.addSource).toHaveBeenCalledWith('source1', {});
  });

  test('addSources adds vector tile sources to map', () => {
    const sourceConfigs: SourceConfig[] = [
      {
        id: 'source1',
        type: Sources.VectorTile,
        definition: {} as SourceSpecification,
      },
    ];

    addSources(map, sourceConfigs, () => {});
    expect(map.addSource).toHaveBeenCalledWith('source1', {});
  });

  test('addSources adds featureService sources to map', () => {
    const sourceConfigs: SourceConfig[] = [
      {
        id: 'source2',
        type: Sources.ESRI,
        definition: {
          url: 'fake-url',
        } as FeatureServiceOptions,
      },
    ];

    const createFeatureService = (sourceId: string, map: Map, options: FeatureServiceOptions) =>
      new FeatureService(sourceId, map, options);

    addSources(map, sourceConfigs, createFeatureService);

    // Verify FeatureService is instantiated correctly
    expect(FeatureService).toHaveBeenCalledWith(
      'source2',
      expect.any(Object), // The map instance
      { url: 'fake-url' }
    );
  });

  test('addLayers adds layers to map', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: { id: 'layer1', type: 'fill', source: 'source1' },
      },
    ];
    addLayers(map, layerDefinitions);
    expect(map.addLayer).toHaveBeenCalledWith({
      id: 'layer1',
      type: 'fill',
      source: 'source1',
    });
  });

  test('addLayers adds sublayerslayers to map', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: null,
        subLayers: [
          {
            id: 'sublayer1',
            controllable: true,
            legend: false,
            config: {
              id: 'sublayer1',
              type: 'fill',
              source: 'source1',
            },
          },
        ],
      },
    ];
    addLayers(map, layerDefinitions);
    expect(map.addLayer).toHaveBeenCalledWith({
      id: 'sublayer1',
      type: 'fill',
      source: 'source1',
    });
  });

  test('addHoverFunctions adds hover functions to map for layers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: { id: 'layer1', type: 'fill', source: 'source1' },
        hoverFunction: vi.fn(() => vi.fn()),
      },
    ];
    addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('mouseenter', 'layer1', expect.any(Function));
    expect(map.on).toHaveBeenCalledWith('mouseleave', 'layer1', expect.any(Function));
  });

  test('addHoverFunctions adds hover functions to map for sublayers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: null,
        subLayers: [
          {
            id: 'sublayer1',
            controllable: true,
            legend: false,
            config: {
              id: 'sublayer1',
              type: 'fill',
              source: 'source1',
            },
            hoverFunction: vi.fn(() => vi.fn()),
          },
        ],
      },
    ];
    addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('mouseenter', 'sublayer1', expect.any(Function));
    expect(map.on).toHaveBeenCalledWith('mouseleave', 'sublayer1', expect.any(Function));
  });

  test('addHoverFunctions adds hover functions with custom exit to map for layers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: { id: 'layer1', type: 'fill', source: 'source1' },
        hoverFunction: vi.fn(() => vi.fn()),
        customHoverExitFunction: vi.fn(() => vi.fn()),
      },
    ];
    addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('mouseenter', 'layer1', expect.any(Function));
    expect(map.on).toHaveBeenCalledWith('mouseleave', 'layer1', expect.any(Function));
  });

  test('addHoverFunctions adds hover functions with custom exit to map for sublayers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: null,
        subLayers: [
          {
            id: 'sublayer1',
            controllable: true,
            legend: false,
            config: {
              id: 'sublayer1',
              type: 'fill',
              source: 'source1',
            },
            hoverFunction: vi.fn(() => vi.fn()),
            customHoverExitFunction: vi.fn(() => vi.fn()),
          },
        ],
      },
    ];
    addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('mouseenter', 'sublayer1', expect.any(Function));
    expect(map.on).toHaveBeenCalledWith('mouseleave', 'sublayer1', expect.any(Function));
  });

  test('addClickFunctions adds click functions to map for layers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: { id: 'layer1', type: 'fill', source: 'source1' },
        clickFunction: vi.fn(() => vi.fn()),
      },
    ];
    addClickFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('click', 'layer1', expect.any(Function));
  });

  test('addClickFunctions adds click functions to map for sublayers', () => {
    const layerDefinitions: MainLayerDefinition[] = [
      {
        id: 'layer1',
        controllable: true,
        legend: false,
        config: null,
        subLayers: [
          {
            id: 'sublayer1',
            controllable: true,
            legend: false,
            config: {
              id: 'sublayer1',
              type: 'fill',
              source: 'source1',
            },
            clickFunction: vi.fn(() => vi.fn()),
          },
        ],
      },
    ];
    addClickFunctions(map, layerDefinitions, hoverPopup, persistentPopup, rootMock, container);
    expect(map.on).toHaveBeenCalledWith('click', 'sublayer1', expect.any(Function));
  });
});
