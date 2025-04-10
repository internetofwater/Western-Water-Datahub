import {
    addSources,
    addLayers,
    addHoverFunctions,
    addClickFunctions,
} from '@/components/Map/utils';
import mapboxglMock, { Map, SourceSpecification, Popup } from 'mapbox-gl';
import {
    MainLayerDefinition,
    SourceConfig,
    Sources,
} from '@/components/Map/types';
import FeatureService, {
    FeatureServiceOptions,
} from '@hansdo/mapbox-gl-arcgis-featureserver';

jest.mock('mapbox-gl');
jest.mock('@hansdo/mapbox-gl-arcgis-featureserver', () =>
    jest.fn().mockImplementation(() => ({
        sourceId: '',
        map: {},
        options: {},
    }))
);

describe('Map Component: utils', () => {
    let map: Map;
    let hoverPopup: Popup;
    let persistentPopup: Popup;

    beforeEach(() => {
        jest.clearAllMocks();
        map = new mapboxglMock.Map({
            container: document.createElement('div'),
            zoom: 1,
            fadeDuration: 0,
            center: [0, 0],
            testMode: true,
        });
        hoverPopup = new mapboxglMock.Popup();
        persistentPopup = new mapboxglMock.Popup();
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

        const createFeatureService = (
            sourceId: string,
            map: Map,
            options: FeatureServiceOptions
        ) => new FeatureService(sourceId, map, options);

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
                hoverFunction: jest.fn(() => jest.fn()),
            },
        ];
        addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'mouseenter',
            'layer1',
            expect.any(Function)
        );
        expect(map.on).toHaveBeenCalledWith(
            'mouseleave',
            'layer1',
            expect.any(Function)
        );
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
                        hoverFunction: jest.fn(() => jest.fn()),
                    },
                ],
            },
        ];
        addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'mouseenter',
            'sublayer1',
            expect.any(Function)
        );
        expect(map.on).toHaveBeenCalledWith(
            'mouseleave',
            'sublayer1',
            expect.any(Function)
        );
    });

    test('addHoverFunctions adds hover functions with custom exit to map for layers', () => {
        const layerDefinitions: MainLayerDefinition[] = [
            {
                id: 'layer1',
                controllable: true,
                legend: false,
                config: { id: 'layer1', type: 'fill', source: 'source1' },
                hoverFunction: jest.fn(() => jest.fn()),
                customHoverExitFunction: jest.fn(() => jest.fn()),
            },
        ];
        addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'mouseenter',
            'layer1',
            expect.any(Function)
        );
        expect(map.on).toHaveBeenCalledWith(
            'mouseleave',
            'layer1',
            expect.any(Function)
        );
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
                        hoverFunction: jest.fn(() => jest.fn()),
                        customHoverExitFunction: jest.fn(() => jest.fn()),
                    },
                ],
            },
        ];
        addHoverFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'mouseenter',
            'sublayer1',
            expect.any(Function)
        );
        expect(map.on).toHaveBeenCalledWith(
            'mouseleave',
            'sublayer1',
            expect.any(Function)
        );
    });

    test('addClickFunctions adds click functions to map for layers', () => {
        const layerDefinitions: MainLayerDefinition[] = [
            {
                id: 'layer1',
                controllable: true,
                legend: false,
                config: { id: 'layer1', type: 'fill', source: 'source1' },
                clickFunction: jest.fn(() => jest.fn()),
            },
        ];
        addClickFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'click',
            'layer1',
            expect.any(Function)
        );
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
                        clickFunction: jest.fn(() => jest.fn()),
                    },
                ],
            },
        ];
        addClickFunctions(map, layerDefinitions, hoverPopup, persistentPopup);
        expect(map.on).toHaveBeenCalledWith(
            'click',
            'sublayer1',
            expect.any(Function)
        );
    });
});
