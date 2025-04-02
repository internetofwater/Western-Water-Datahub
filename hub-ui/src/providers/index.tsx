'use client';

import { PropsWithChildren, Suspense } from 'react';
import { Map as MapProvider } from '@/providers/Map';
import { Mantine as MantineProvider } from './Mantine';

/**
 * Wrapping component for grouping all providers
 *
 * Providers:
 * - Mantine: Define theme for application
 * - Map: Allow access to map objects across application via hook useMap
 *
 * @component
 */
export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Suspense fallback={children}>
            <MantineProvider>
                <MapProvider>{children}</MapProvider>
            </MantineProvider>
        </Suspense>
    );
};
