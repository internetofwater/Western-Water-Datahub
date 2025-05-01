import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartData, ChartOptions } from 'chart.js';
import { LineChart } from '@/components/LineChart';

jest.mock('react-chartjs-2', () => {
    const { forwardRef } = require('react');
    const Line = forwardRef(
        (props: {}, ref: React.ForwardedRef<HTMLDivElement>) => (
            <div ref={ref} {...props}></div>
        )
    );
    return {
        Line,
    };
});

describe('LineChart Component', () => {
    const mockData: ChartData<'line', any> = {
        labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
        ],
        datasets: [
            {
                label: 'TEST',
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
                data: [65, 59, 80, 81, 56, 55, 40],
            },
        ],
    };

    const mockOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'TEST',
            },
        },
    };

    test('renders LineChart component with provided data and options', () => {
        render(<LineChart data={mockData} options={mockOptions} />);

        const canvas = screen.getByTestId('line-chart');
        // Check if the chart is rendered
        expect(canvas).toBeInTheDocument();
    });
});
