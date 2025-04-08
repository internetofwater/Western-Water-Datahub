import { SourceId } from '@/features/Map/config';
import { ComboboxData, ComboboxItem } from '@mantine/core';
import { FeatureCollection } from 'geojson';
import {
    ExpressionSpecification,
    GeoJSONSourceSpecification,
    Map as MapObj,
    MapSourceDataEvent,
} from 'mapbox-gl';

export const createOptions = (
    map: MapObj,
    sourceId: SourceId,
    property: string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
    });

    const options = new Map<string, ComboboxItem>();
    options.set('all', { value: 'all', label: defaultLabel });
    features.forEach((feature) => {
        if (feature.properties) {
            const value = feature.properties[property] as string;

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: value,
                });
            }
        }
    });
    return Array.from(options.values());
};

export const createFilteredOptions = (
    map: MapObj,
    sourceId: SourceId,
    filter: ExpressionSpecification,
    property: string,
    defaultLabel: string
): ComboboxData => {
    const features = map.querySourceFeatures(sourceId, {
        sourceLayer: sourceId,
        filter: filter,
    });

    const options = new Map<string, ComboboxItem>();
    options.set('all', { value: 'all', label: defaultLabel });
    features.forEach((feature) => {
        if (feature.properties) {
            const value = feature.properties[property] as string;

            if (!options.has(value)) {
                options.set(value, {
                    value: value,
                    label: value,
                });
            }
        }
    });

    return Array.from(options.values());
};

type Event = {
    type: 'sourcedata';
    target: MapObj;
} & MapSourceDataEvent;

export const shouldLoadOptions = (
    map: MapObj,
    sourceId: SourceId,
    event: Event
): boolean => {
    return Boolean(
        event.sourceId === sourceId &&
            event.source &&
            (event.source as GeoJSONSourceSpecification).data &&
            (
                (event.source as GeoJSONSourceSpecification)
                    .data as FeatureCollection
            ).features.length > 0 &&
            map.getSource(sourceId) &&
            map.isSourceLoaded(sourceId)
    );
};
