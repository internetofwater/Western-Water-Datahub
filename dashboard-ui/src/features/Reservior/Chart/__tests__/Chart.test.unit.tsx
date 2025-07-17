/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React, { act } from 'react';
import { render } from '@/utils/test-utils';
import { screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import wwdhService from '@/services/init/wwdh.init';
import * as utils from '@/features/Reservior/Chart/utils';
import { Chart } from '@/features/Reservior/Chart';
import { LayerId, SourceId, SubLayerId } from '@/features/Map/consts';
import { getReservoirConfig } from '@/features/Map/utils';

jest.mock('@/lib/main', () => ({
    __esModule: true,
    default: jest.fn((selector) => selector({ setChartUpdate: jest.fn() })),
}));

jest.mock('@/services/init/edr.init');

jest.mock('@/features/Reservior/Chart/utils', () => ({
    getDateRange: jest.fn(() => ({
        startDate: '2022-01-01',
        endDate: '2023-01-01',
    })),
    getLabelsAndValues: jest.fn(() => [
        { x: '2023-01-01', y: 100 },
        { x: '2023-02-01', y: 200 },
    ]),
}));

describe('Chart component', () => {
    const mockRef = { current: null };

    const mockCoverageCollection = {
        coverages: [
            {
                domain: {
                    axes: {
                        t: {
                            values: ['2023-01-01', '2023-02-01'],
                        },
                    },
                },
                ranges: {
                    'Lake/Reservoir Storage': {
                        values: [100, 200],
                    },
                },
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(utils, 'getDateRange').mockReturnValue({
            startDate: '2022-01-01',
            endDate: '2023-01-01',
        });
        jest.spyOn(utils, 'getLabelsAndValues').mockReturnValue([
            { x: '2023-01-01', y: 100 },
            { x: '2023-02-01', y: 200 },
        ]);
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    test('renders loading state initially', async () => {
        (wwdhService.getLocation as jest.Mock).mockResolvedValueOnce(
            mockCoverageCollection
        );
        render(
            <Chart
                id={1}
                ref={mockRef}
                config={getReservoirConfig(SourceId.RiseEDRReservoirs)!}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('chart-loader-bar')).toBeInTheDocument();
        });
    });

    test('renders chart after data loads', async () => {
        (wwdhService.getLocation as jest.Mock).mockResolvedValueOnce(
            mockCoverageCollection
        );
        render(
            <Chart
                id={1}
                ref={mockRef}
                config={getReservoirConfig(SourceId.RiseEDRReservoirs)!}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Storage Volume/i)).toBeInTheDocument();
        });
    });

    // TODO: better mock for message channel to fake error better
    // test('displays error message on fetch failure', async () => {
    //     (edrService.getLocation as jest.Mock).mockRejectedValueOnce(
    //         new Error('Fetch failed')
    //     );
    //     render(<Chart id={1} ref={mockRef} />);

    //     await waitFor(() => {
    //         expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    //     });
    // });

    test('toggles range with radio buttons', async () => {
        (wwdhService.getLocation as jest.Mock).mockResolvedValue(
            mockCoverageCollection
        );
        render(
            <Chart
                id={1}
                ref={mockRef}
                config={getReservoirConfig(SourceId.RiseEDRReservoirs)!}
            />
        );

        await waitFor(() => {
            const fiveYearRadio = screen.getByTestId('5-year-radio');
            fireEvent.click(fiveYearRadio);
            expect(fiveYearRadio).toBeChecked();
        });
    });
});
