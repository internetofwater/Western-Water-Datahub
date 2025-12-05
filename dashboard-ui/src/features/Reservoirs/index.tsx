import { useReservoirData } from '@/hooks/useReservoirData';
import { Filter } from './Filter';
import { useEffect, useState } from 'react';
import {
    OrganizedFeature,
    OrganizedProperties,
    SortBy,
    SortOrder,
} from './types';
import { Table } from './Table';
import { getReservoirConfig } from '../Map/utils';
import { SourceId } from '../Map/consts';
import dayjs from 'dayjs';
import useMainStore from '@/stores/main/main';
import {
    BasinDefault,
    RegionDefault,
    StateDefault,
} from '@/stores/main/consts';

const Reservoirs: React.FC = () => {
    const region = useMainStore((state) => state.region);
    const basin = useMainStore((state) => state.basin);
    const state = useMainStore((state) => state.state);

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Capacity);
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const { reservoirCollections } = useReservoirData();

    const [organizedReservoirs, setOrganizedReservoirs] = useState<
        OrganizedFeature[]
    >([]);
    const [filteredReservoirs, setFilteredReservoirs] = useState<
        OrganizedFeature[]
    >([]);

    const getSortByProperty = (sortBy: SortBy): keyof OrganizedProperties => {
        switch (sortBy) {
            case SortBy.PercentFull:
                return 'percentFull';
            case SortBy.PercentAverage:
                return 'percentAverage';
            case SortBy.Storage:
                return 'storage';
            default:
            case SortBy.Capacity:
                return 'capacity';
        }
    };

    const getSort =
        (sortBy: SortBy, sortOrder: SortOrder) =>
        (featureA: OrganizedFeature, featureB: OrganizedFeature) => {
            const property = getSortByProperty(sortBy);
            const valueA = featureA.properties[property];
            const valueB = featureB.properties[property];

            if (typeof valueA !== 'number' || typeof valueB !== 'number') {
                return 0;
            }

            if (sortOrder === 'desc') {
                return valueB - valueA;
            }

            return valueA - valueB;
        };

    useEffect(() => {
        if (!reservoirCollections) {
            return;
        }

        const organizedReservoirs: OrganizedFeature[] = Object.entries(
            reservoirCollections
        ).flatMap(([collectionId, featureCollection]) => {
            const config = getReservoirConfig(collectionId as SourceId);
            if (!config) return [];

            return featureCollection.features
                .filter((feature) => Boolean(feature.properties))
                .map((feature) => {
                    const props = feature.properties!;
                    const getNumber = (key: keyof typeof props) =>
                        Number(props[key]);
                    const getString = (key: keyof typeof props) =>
                        String(props[key]);

                    const storage = getNumber(config.storageProperty);
                    const capacity = getNumber(config.capacityProperty);
                    const average = getNumber(config.thirtyYearAverageProperty);
                    const regionConnector = getString(
                        config.regionConnectorProperty
                    );
                    const basinConnector = getString(
                        config.basinConnectorProperty
                    );
                    const stateConnector = getString(
                        config.stateConnectorProperty
                    );

                    return {
                        ...feature,
                        properties: {
                            identifier:
                                config.identifierType === 'number'
                                    ? Number(props[config.identifierProperty])
                                    : String(props[config.identifierProperty]),
                            name: getString(config.labelProperty),
                            dateMeasured: dayjs(
                                getString(config.storageDateProperty)
                            ).format('MM/DD/YYYY'),
                            storage,
                            capacity,
                            percentFull: (storage / capacity) * 100,
                            percentAverage: (storage / average) * 100,
                            sourceId: collectionId,
                            regionConnector,
                            basinConnector,
                            stateConnector,
                        },
                    } as OrganizedFeature;
                });
        });

        setOrganizedReservoirs(organizedReservoirs);
    }, [reservoirCollections]);

    useEffect(() => {
        if (organizedReservoirs.length === 0) {
            return;
        }

        const filterFunctions: Array<(feature: OrganizedFeature) => boolean> =
            [];

        if (search.length > 0) {
            const lower = search.toLowerCase();
            filterFunctions.push((feature) =>
                feature.properties.name.toLowerCase().includes(lower)
            );
        }

        if (region !== RegionDefault) {
            filterFunctions.push(
                (feature) => feature.properties.regionConnector === region
            );
        }
        if (basin !== BasinDefault) {
            filterFunctions.push(
                (feature) => feature.properties.basinConnector === basin
            );
        }
        if (state !== StateDefault) {
            filterFunctions.push(
                (feature) => feature.properties.stateConnector === state
            );
        }

        const filteredReservoirs = organizedReservoirs
            .filter(
                (feature) =>
                    filterFunctions.length === 0 ||
                    filterFunctions.every((filter) => filter(feature))
            )
            .sort(getSort(sortBy, sortOrder));

        setFilteredReservoirs(filteredReservoirs);
    }, [organizedReservoirs, search, region, basin, state, sortBy, sortOrder]);

    const handleSearchChange = (search: string) => setSearch(search);
    const handleSortByChange = (sortBy: SortBy) => setSortBy(sortBy);

    return (
        <>
            <Filter
                search={search}
                handleSearchChange={handleSearchChange}
                sortBy={sortBy}
                handleSortByChange={handleSortByChange}
            />
            {filteredReservoirs && (
                <Table filteredReservoirs={filteredReservoirs} />
            )}
        </>
    );
};

export default Reservoirs;
