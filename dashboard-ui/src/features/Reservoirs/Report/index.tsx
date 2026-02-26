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
    ComboboxItem,
    Group,
    Stack,
    Switch,
    Title,
} from '@mantine/core';
import { MAP_ID } from '@/features/Map/consts';
import { useMap } from '@/contexts/MapContexts';
import { ReportService } from '@/services/report/report.service';
import { useEffect, useRef, useState } from 'react';
import { Map } from 'mapbox-gl';
import { loadImages } from '@/features/Map/utils';
import { Feature, Point } from 'geojson';
import styles from '@/features/Reservoirs/Report/Report.module.css';
import { OrganizedProperties } from '@/features/Reservoirs/types';
import { formatOptions } from '../Filter/Selectors/utils';
import { useLoading } from '@/hooks/useLoading';
import Select from '@/components/Select';
import { MAX_POSITIONS } from '@/services/report/report.consts';
import { getKey } from '../utils';

type Props = {
    accessToken: string;
    reservoirs: Feature<Point, OrganizedProperties>[];
    pickFromTable: boolean;
    onPickFromTableChange: (pickFromTable: boolean) => void;
    selectedReservoirs: string[];
    onSelectedReservoirsChange: (selectedReservoirs: string[]) => void;
};

const Report: React.FC<Props> = (props) => {
    const {
        accessToken,
        reservoirs,
        pickFromTable,
        onPickFromTableChange,
        selectedReservoirs,
        onSelectedReservoirsChange,
    } = props;

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const [options, setOptions] = useState<ComboboxItem[]>([]);

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
                if (features.length === MAX_POSITIONS) {
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
        const newOptions = formatOptions(
            reservoirs,
            (feature) => getKey(feature),
            (feature) => feature.properties.name,
            '',
            '',
            true
        );

        if (pickFromTable) {
            const hiddenOptions = options.filter(
                (option) =>
                    selectedReservoirs.includes(option.value) &&
                    !newOptions.some(
                        (newOption) => newOption.value === option.value
                    )
            );

            newOptions.push(...hiddenOptions);
        }

        setOptions(newOptions);
    }, [reservoirs]);

    useEffect(() => {
        if (!map) {
            return;
        }
        const hidden = document.createElement('div');

        // height: 0, width: 0, overflow: 'hidden'

        hidden.style.width = '0';
        hidden.style.height = '0';
        hidden.style.overflow = 'hidden';

        document.body.appendChild(hidden);

        container.current = document.createElement('div');
        container.current.style.width = '1600px';
        container.current.style.height = '900px';
        hidden.appendChild(container.current);
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

    // const filter: OptionsFilter = ({ options }) => {
    //     return (options as ComboboxItem[]).filter((option) =>
    //         reservoirs.some((reservoir) => getKey(reservoir) === option.value)
    //     );
    // };

    const labelsSwitchProps = isFetchingReservoirs
        ? { 'data-disabled': true }
        : {};

    return (
        <Accordion
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
                            // filter={filter}
                            onChange={onSelectedReservoirsChange}
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
                                    onPickFromTableChange(
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
