import {
    getDateRange,
    getLabelsAndValues,
} from '@/features/Reservior/Chart/utils';
import { CoverageCollection, CoverageJSON } from '@/services/edr.service';

describe('getDateRange', () => {
    test('returns correct start and end dates for 1 year', () => {
        const { startDate, endDate } = getDateRange(1);
        const now = new Date();
        const expectedEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
        );
        const expectedStart = new Date(expectedEnd);
        expectedStart.setFullYear(expectedStart.getFullYear() - 1);

        expect(startDate).toBe(expectedStart.toISOString().split('T')[0]);
        expect(endDate).toBe(expectedEnd.toISOString().split('T')[0]);
    });

    test('returns correct start and end dates for 5 years', () => {
        const { startDate, endDate } = getDateRange(5);
        const now = new Date();
        const expectedEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
        );
        const expectedStart = new Date(expectedEnd);
        expectedStart.setFullYear(expectedStart.getFullYear() - 5);

        expect(startDate).toBe(expectedStart.toISOString().split('T')[0]);
        expect(endDate).toBe(expectedEnd.toISOString().split('T')[0]);
    });
});

describe('getLabelsAndValues', () => {
    const mockCoverageCollection: CoverageCollection = {
        type: 'CoverageCollection',
        parameters: {
            'Lake/Reservoir Storage': {
                type: 'Parameter',
                description: {
                    en: 'Instant daily lake/reservoir storage volume in acre-feet. Daily refers to one measurement per day.',
                },
                unit: {
                    symbol: 'af',
                },
                observedProperty: {
                    id: '3',
                    label: {
                        en: 'Lake/Reservoir Storage',
                    },
                },
            },
        },
        referencing: [
            {
                coordinates: ['x', 'y'],
                system: {
                    type: 'GeographicCRS',
                    id: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84',
                },
            },
            {
                coordinates: ['z'],
                system: {
                    type: 'VerticalCRS',
                    cs: {
                        csAxes: [
                            {
                                name: {
                                    en: 'time',
                                },
                                direction: 'down',
                                unit: {
                                    symbol: 'time',
                                },
                            },
                        ],
                    },
                },
            },
            {
                coordinates: ['t'],
                system: {
                    type: 'TemporalRS',
                    calendar: 'Gregorian',
                },
            },
        ],
        coverages: [
            {
                type: 'Coverage',
                domain: {
                    type: 'Domain',
                    domainType: '',
                    referencing: [],
                    axes: {
                        x: {
                            values: [-98.3133],
                        },
                        y: {
                            values: [39.4961],
                        },
                        t: {
                            values: [
                                '2025-05-20T05:00:00+00:00',
                                '2025-05-21T05:00:00+00:00',
                            ],
                        },
                    },
                },
                parameters: {},
                ranges: {
                    'Lake/Reservoir Storage': {
                        values: [156168.0, 156071.0],
                        type: 'NdArray',
                    },
                },
            },
        ],
    };

    test('returns sorted array of x/y values', () => {
        const result = getLabelsAndValues(
            mockCoverageCollection,
            'Lake/Reservoir Storage'
        );
        expect(result).toEqual([
            { x: '2025-05-20T05:00:00+00:00', y: 156168.0 },
            { x: '2025-05-21T05:00:00+00:00', y: 156071.0 },
        ]);
    });

    test('throws error if parameter is missing', () => {
        const badCollection = {
            coverages: [
                {
                    domain: { axes: { t: { values: [] } } },
                    ranges: {},
                },
            ],
        } as unknown as CoverageCollection;

        expect(() => getLabelsAndValues(badCollection, 'MissingParam')).toThrow(
            'Missing MissingParam values for this location'
        );
    });

    test('throws error if coverages array is empty', () => {
        const emptyCollection = {
            coverages: [] as CoverageJSON[],
        } as CoverageCollection;
        expect(() =>
            getLabelsAndValues(emptyCollection, 'Lake/Reservoir Storage')
        ).toThrow();
    });
});
