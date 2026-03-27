/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import loadingManager from '@/managers/Loading.init';
import useSessionStore from '@/stores/session';
import { LoadingType } from '@/stores/session/types';

export const useLoading = () => {
    const loadingInstances = useSessionStore((state) => state.loadingInstances);

    const [isFetchingReservoirs, setIsFetchingReservoirs] = useState(false);
    const [isFetchingSnotel, setIsFetchingSnotel] = useState(false);
    const [isFetchingSingleReservoir, setIsFetchingSingleReservoir] =
        useState(false);

    useEffect(() => {
        setIsFetchingReservoirs(
            loadingManager.has({ type: LoadingType.Reservoirs })
        );
        setIsFetchingSnotel(loadingManager.has({ type: LoadingType.Snotel }));
        setIsFetchingSingleReservoir(
            loadingManager.has({ type: LoadingType.SingleReservoir })
        );
    }, [loadingInstances]);

    return {
        isFetchingReservoirs,
        isFetchingSnotel,
        isFetchingSingleReservoir,
    };
};
