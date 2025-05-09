import { useEffect, useRef, useState } from 'react';
import edrService from '@/services/init/edr.init';
import { Feature, FeatureCollection, Point } from 'geojson';
import { ReservoirProperties } from '@/features/Map/types';
import useMainStore from '@/lib/main';

export const useReservoirData = () => {
    const reservoirCollection = useMainStore(
        (state) => state.reservoirCollection
    );
    const setReservoirCollection = useMainStore(
        (state) => state.setReservoirCollection
    );

    const [loading, setLoading] = useState(false);
    const controller = useRef<AbortController | null>(null);
    const isMounted = useRef(true);

    const fetchReservoirLocations = async () => {
        try {
            setLoading(true);
            controller.current = new AbortController();

            const result = await edrService.getLocations<
                FeatureCollection<Point, ReservoirProperties>
            >('rise-edr', {
                signal: controller.current.signal,
                params: {
                    'parameter-name': 'reservoirStorage',
                },
            });

            if (isMounted.current) {
                setReservoirCollection(result);
                setLoading(false);
            }
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error(error);
                setLoading(false);
            }
        }
    };

    // const findReservoirs = <T extends keyof ReservoirProperties>(
    //     searchObject: { [key in T]: ReservoirProperties[key] },
    //     comparisonLogic: (
    //         property: ReservoirProperties[T],
    //         value: ReservoirProperties[T]
    //     ) => boolean
    // ): Feature<Point, ReservoirProperties>[] => {
    //     return reservoirCollection.features.filter((feature) =>
    //         (
    //             Object.entries(searchObject) as [T, ReservoirProperties[T]][]
    //         ).every(([key, value]) =>
    //             comparisonLogic(feature.properties[key], value)
    //         )
    //     );
    // };

    const fetchReservoirItem = async (
        reservoirId: string
    ): Promise<Feature<Point, ReservoirProperties> | null> => {
        try {
            controller.current = new AbortController();

            const feature = await edrService.getItem<
                Feature<Point, ReservoirProperties>
            >('rise-edr', reservoirId, {
                signal: controller.current.signal,
            });

            return feature;
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                console.error(error);
            }
            return null;
        }
    };

    useEffect(() => {
        isMounted.current = true;
        if (!reservoirCollection) {
            void fetchReservoirLocations();
        }

        return () => {
            isMounted.current = false;
            controller.current?.abort();
        };
    }, []);

    return {
        reservoirCollection,
        loading,
        fetchReservoirItem,
        // findReservoirs,
    };
};
