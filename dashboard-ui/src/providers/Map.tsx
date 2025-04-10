import { PropsWithChildren } from 'react';
import { MapProvider } from '@/contexts/MapContexts';
import { MAP_ID } from '@/features/Map/config';

/**
 * Provides Map Context to allow accessing maps across application
 *
 * @component
 */
export const Map: React.FC<PropsWithChildren> = ({ children }) => {
    const mapIds: string[] = [MAP_ID];

    return <MapProvider mapIds={mapIds}>{children}</MapProvider>;
};
