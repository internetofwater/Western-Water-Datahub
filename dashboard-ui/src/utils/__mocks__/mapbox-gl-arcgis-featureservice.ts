import { FeatureServiceOptions } from '@hansdo/mapbox-gl-arcgis-featureserver';
import { Map } from 'mapbox-gl';

class FeatureService {
    sourceId: string;
    map: Map;
    options: FeatureServiceOptions;

    constructor(sourceId: string, map: Map, options: FeatureServiceOptions) {
        this.sourceId = sourceId;
        this.map = map;
        this.options = options;
    }
}

export { FeatureService };
