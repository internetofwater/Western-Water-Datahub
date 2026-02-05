/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    getHighestCapacityReservoirs,
    IdentifiableProperties,
} from '@/services/report.utils';
import { Button } from '@mantine/core';
import { MAP_ID, ReservoirConfigs } from '../Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { ReportService } from '@/services/report.service';
import { useEffect, useRef, useState } from 'react';
import { Map } from 'mapbox-gl';
import { loadImages } from '../Map/utils';
import { Feature, Point } from 'geojson';

type Props = {
    accessToken: string;
};

export const Report: React.FC<Props> = (props) => {
    const { accessToken } = props;

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const cloneMap = useRef<Map>(null);
    const container = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    const handleClick = () => {
        if (!map || !cloneMap.current || !isMapLoaded || !container.current) {
            return;
        }

        cloneMap.current.setStyle(map.getStyle());
        cloneMap.current.setCenter(map.getCenter());
        cloneMap.current.setZoom(Math.max(map.getZoom() - 1, 0));
        const features: Feature<Point, IdentifiableProperties>[] = [];
        for (const config of ReservoirConfigs) {
            features.push(...getHighestCapacityReservoirs(map, config));
        }

        void new ReportService().report(
            cloneMap.current,
            features,
            container.current
        );
    };

    useEffect(() => {
        if (!map) {
            return;
        }

        container.current = document.createElement('div');
        container.current.style.width = `1600px`;
        // container.current.style.height = `1236px`;
        container.current.style.height = `900px`;
        document.body.appendChild(container.current);
        cloneMap.current = new Map({
            accessToken: accessToken,
            container: container.current,
            center: map.getCenter(),
            style: map.getStyle(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
            projection: map.getProjection(),
        });

        loadImages(cloneMap.current);
        cloneMap.current.once('load', () => {
            if (isMounted.current) {
                setIsMapLoaded(true);
            }
        });
    }, [map]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return <Button onClick={handleClick}>CLICK</Button>;
};
