import { PropsWithChildren } from 'react';
import { MapProvider } from '@/contexts/MapContexts';

/**
 * Provides Map Context to allow accessing maps across application
 *
 * @component
 */
export const Map: React.FC<PropsWithChildren> = ({ children }) => {
    const mapIds: string[] = [];

    return <MapProvider mapIds={mapIds}>{children}</MapProvider>;
};
