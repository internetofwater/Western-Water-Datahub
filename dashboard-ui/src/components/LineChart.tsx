/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React, { RefObject } from 'react';
import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    ChartData,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Filler,
    TimeScale,
    ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: ChartData<'line', any>;
    options: ChartOptions<'line'>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref?: RefObject<ChartJS<'line', any> | null>;
};

/**

 * @component
 */
export const LineChart: React.FC<Props> = (props) => {
    const { ref = null, data, options } = props;

    return (
        <Line
            data-testid="line-chart"
            ref={ref}
            data={data}
            options={options}
        />
    );
};
