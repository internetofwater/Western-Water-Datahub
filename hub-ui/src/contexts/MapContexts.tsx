'use client';
import { Popup, Map } from 'mapbox-gl';
import React, { createContext, useState, useContext, ReactNode } from 'react';

/**
 * Defines the structure for a single map context, including the map instance, hover popup, persistent popup, and a function to set the map context.
 *
 * Properties:
 * - map: Map | null - The Mapbox GL map instance.
 * - hoverPopup: Popup | null - The popup displayed on hover.
 * - persistentPopup: Popup | null - The popup displayed persistently.
 * - setMap: (map: Map, hoverPopup: Popup, persistentPopup: Popup) => void - Function to set the map context.
 * @interface
 */
interface MapContextType {
    map: Map | null;
    hoverPopup: Popup | null;
    persistentPopup: Popup | null;
    setMap: (map: Map, hoverPopup: Popup, persistentPopup: Popup) => void;
}

/**
 * Defines the structure for multiple map contexts, keyed by map ID.
 *
 * Properties:
 * - [key: string]: MapContextType - The map context for each map ID.
 * @interface
 */
interface MapContextsType {
    [key: string]: MapContextType;
}

/**
 * Creates a React context for managing multiple map instances and their associated popups.
 *
 * Default value:
 * - undefined - The initial value for the context.
 * @constant
 */
const MapContexts = createContext<MapContextsType | undefined>(undefined);

/**
 * A context provider component that initializes and manages multiple map contexts based on provided map IDs.
 *
 * Props:
 * - mapIds: string[] - Array of map IDs to initialize contexts for.
 * - children: ReactNode - The child components to be rendered within the provider.
 *
 * State:
 * - maps: MapContextsType - The current map contexts.
 *
 * Functions:
 * - setMap: Updates the map context for a specific map ID with the provided map instance, hover popup, and persistent popup.
 * @component
 */
export const MapProvider: React.FC<{
    mapIds: string[];
    children: ReactNode;
}> = ({ mapIds, children }) => {
    const setMap = (
        id: string,
        map: Map | null,
        hoverPopup: Popup,
        persistentPopup: Popup
    ) => {
        const _maps: MapContextsType = {
            ...maps,
            [id]: {
                map,
                hoverPopup,
                persistentPopup,
                setMap: (m: Map, h: Popup, p: Popup) => setMap(id, m, h, p),
            },
        };

        setMaps(_maps);
    };

    // Create default map context for all provided map id's
    const DEFAULT_MAPS: MapContextsType = {};
    mapIds.forEach((mapId) => {
        DEFAULT_MAPS[mapId] = {
            map: null,
            hoverPopup: null,
            persistentPopup: null,
            setMap: (map: Map, hoverPopup: Popup, persistentPopup: Popup) =>
                setMap(mapId, map, hoverPopup, persistentPopup),
        };
    });

    const [maps, setMaps] = useState<MapContextsType>(DEFAULT_MAPS);

    return <MapContexts.Provider value={maps}>{children}</MapContexts.Provider>;
};

/**
 * A custom hook for accessing a specific map context by its ID.
 *
 * Parameters:
 * - id: string - The ID of the map context to access.
 *
 * Returns:
 * - MapContextType - The map context for the specified ID.
 *
 * Throws:
 * - Error if used outside of a MapProvider.
 *
 * Example Usage:
 * ```tsx
 * import React from 'react';
 * import Map from '@/app/components/Map';
 * import { useMap, MapProvider } from '@/app/contexts/MapContexts';
 *
 * const MyMapComponent: React.FC = () => {
 *     const { map } = useMap('example');
 *
 *     React.useEffect(() => {
 *          if (!map) {
 *            return;
 *          }
 *
 *          // You can now call all map functions like `on()`
 *     }, [map]);
 *
 *     return (
 *         <Map
 *            accessToken={accessToken}
 *            id={'example'}
 *            sources={sourceConfigs}
 *            layers={layerDefinitions}
 *            options={{
 *                style: 'mapbox://styles/mapbox/standard',
 *                center: [-98.5795, 39.8282],
 *                zoom: 2,
 *                maxZoom: 20,
 *            }}
 *            controls={{
 *                scaleControl: true,
 *                navigationControl: true,
 *            }}
 *          />
 *      );
 * };
 *
 * const App: React.FC = () => (
 *     <MapProvider mapIds={['example']}>
 *         <MyMapComponent />
 *     </MapProvider>
 * );
 *
 * export default App;
 * ```
 * @hook
 */
export const useMap = (id: string): MapContextType => {
    const context = useContext(MapContexts);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context[id];
};
