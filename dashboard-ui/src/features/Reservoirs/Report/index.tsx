/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import {
    Accordion,
    AccordionControl,
    AccordionItem,
    AccordionPanel,
    Button,
    ComboboxData,
    Group,
    Stack,
    Switch,
    Title,
} from '@mantine/core';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { positions, ReportService } from '@/services/report.service';
import { useEffect, useRef, useState } from 'react';
import { Map } from 'mapbox-gl';
import { loadImages } from '@/features/Map/utils';
import { Feature, Point } from 'geojson';
import styles from '@/features/Reservoirs/Report/Report.module.css';
import { OrganizedProperties } from '@/features/Reservoirs/types';
import { formatOptions } from '../Filter/Selectors/utils';
import { useLoading } from '@/hooks/useLoading';
import Select from '@/components/Select';

type Props = {
    accessToken: string;
    reservoirs: Feature<Point, OrganizedProperties>[];
    pickFromTable: boolean;
    handlePickFromTableChange: (pickFromTable: boolean) => void;
};

const MAX_RESERVOIRS = positions.length;

const Report: React.FC<Props> = (props) => {
    const {
        accessToken,
        reservoirs,
        pickFromTable,
        handlePickFromTableChange,
    } = props;

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const [selectedReservoirs, setSelectedReservoirs] = useState<string[]>([]);
    const [options, setOptions] = useState<ComboboxData>([]);

    const cloneMap = useRef<Map>(null);
    const container = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    const { map } = useMap(MAP_ID);

    const { isFetchingReservoirs } = useLoading();

    const handleClick = () => {
        if (!map || !cloneMap.current || !isMapLoaded || !container.current) {
            return;
        }

        cloneMap.current.setStyle(map.getStyle());
        cloneMap.current.setCenter(map.getCenter());
        cloneMap.current.setZoom(Math.max(map.getZoom() - 0.5, 0));

        const selectionSet = new Set(selectedReservoirs);

        const features: typeof reservoirs = [];
        for (const reservoir of reservoirs) {
            const key = `${String(reservoir.id)}_${
                reservoir.properties.sourceId
            }`;
            if (selectionSet.has(key)) {
                features.push(reservoir);

                // Stop early if we are already at the limit
                if (features.length === MAX_RESERVOIRS) {
                    break;
                }
            }
        }

        void new ReportService().report(
            cloneMap.current,
            features,
            container.current
        );
    };

    useEffect(() => {
        if (pickFromTable) {
            return;
        }

        const options = formatOptions(
            reservoirs,
            (feature) =>
                `${String(feature.id)}_${String(feature.properties.sourceId)}`,
            (feature) => feature.properties.name,
            '',
            '',
            true
        );

        setOptions(options);

        const newSelectedReservoirs = [];
        for (const reservoirIdentifier of selectedReservoirs) {
            const [id, sourceId] = reservoirIdentifier.split('_');

            if (
                reservoirs.some(
                    (reservoir) =>
                        String(reservoir.id) === id &&
                        reservoir.properties.sourceId === sourceId
                )
            ) {
                newSelectedReservoirs.push(`${id}_${sourceId}`);
            }
        }

        if (!pickFromTable && newSelectedReservoirs.length < MAX_RESERVOIRS) {
            const selectionSet = new Set(newSelectedReservoirs);

            for (const feature of reservoirs) {
                if (newSelectedReservoirs.length >= MAX_RESERVOIRS) {
                    break;
                }

                const key = `${String(feature.id)}_${String(
                    feature.properties.sourceId
                )}`;
                if (!selectionSet.has(key)) {
                    newSelectedReservoirs.push(key);
                    selectionSet.add(key);
                }
            }
        }

        setSelectedReservoirs(newSelectedReservoirs);
    }, [reservoirs, pickFromTable]);

    useEffect(() => {
        if (!map) {
            return;
        }

        container.current = document.createElement('div');
        container.current.style.width = '1600px';
        container.current.style.height = '900px';
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

    const labelsSwitchProps = isFetchingReservoirs
        ? { 'data-disabled': true }
        : {};

    return (
        <Accordion
            defaultValue={'report-content'}
            classNames={{
                root: styles.root,
                content: styles.content,
                control: styles.control,
            }}
        >
            <AccordionItem value={'report-content'}>
                <AccordionControl>
                    <Title order={3} size="h6">
                        Report
                    </Title>
                </AccordionControl>
                <AccordionPanel>
                    <Stack gap={'var(--default-spacing)'}>
                        <Select
                            size="xs"
                            className={styles.select}
                            classNames={{
                                root: styles.select,
                                input: styles.input,
                                pill: styles.pill,
                                pillsList: styles.pillsList,
                            }}
                            label="Reservoirs"
                            multiple
                            placeholder="Select..."
                            data={options}
                            value={selectedReservoirs}
                            onChange={setSelectedReservoirs}
                            disabled={isFetchingReservoirs}
                        />
                        <Group
                            justify="space-between"
                            gap={'var(--default-spacing)'}
                        >
                            <Switch
                                size="xs"
                                mt="calc(var(--default-spacing) / 2)"
                                disabled={isFetchingReservoirs}
                                classNames={{ label: styles.label }}
                                label="Select reservoirs from table"
                                checked={pickFromTable}
                                onClick={(event) =>
                                    handlePickFromTableChange(
                                        event.currentTarget.checked
                                    )
                                }
                                {...labelsSwitchProps}
                            />
                            <Button onClick={handleClick}>Generate</Button>
                        </Group>
                    </Stack>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

export default Report;
