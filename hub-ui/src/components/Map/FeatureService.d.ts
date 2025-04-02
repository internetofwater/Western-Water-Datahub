// @types/hansdo__mapbox-gl-arcgis-featureserver/index.d.ts

declare module '@hansdo/mapbox-gl-arcgis-featureserver' {
    import { Map } from 'mapbox-gl';

    export interface FeatureServiceOptions {
        url: string;
        simplifyFactor?: number;
    }

    class FeatureService {
        constructor(id: string, map: Map, options: FeatureServiceOptions);
    }

    export default FeatureService;
}
