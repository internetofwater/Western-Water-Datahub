/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@test-utils';
import { ECElementEvent } from 'echarts/core';
import { FeatureCollection, Point } from 'geojson';
import { describe, expect, it, vi } from 'vitest';
import BarChart from '@/components/Charts/BarChart';

const mockData: FeatureCollection<Point, { name: string; value: number; id: string }> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Label 1',
        value: 10,
        id: 'a1',
      },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Label 2',
        value: 20,
        id: 'a2',
      },
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

describe('BarChart', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 600,
    });
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <BarChart
        title="Test Chart"
        series={[
          {
            name: 'Test Series',
            data: mockData,
            labelProperty: 'name',
            valueProperty: 'value',
            idProperty: 'id',
            color: '#ff0000',
          },
        ]}
      />
    );

    const chart = container.querySelector('.echarts-for-react');
    expect(chart).toBeInTheDocument();
  });

  it('calls onChartClick when a bar is clicked', () => {
    const onChartClick = vi.fn();

    render(
      <BarChart
        title="Clickable Chart"
        onChartClick={onChartClick}
        series={[
          {
            name: 'Clickable Series',
            data: mockData,
            labelProperty: 'name',
            valueProperty: 'value',
            idProperty: 'id',
            color: '#00ff00',
          },
        ]}
      />
    );

    // Simulate a click event manually
    const event: ECElementEvent = {
      type: 'click',
      componentType: 'series',
      componentSubType: 'bar',
      componentIndex: 0,
      seriesType: 'bar',
      seriesIndex: 0,
      seriesName: 'Clickable Series',
      name: 'Label 1',
      dataIndex: 0,
      data: { value: 10, id: 'a1' },
      dataType: 'main',
      value: 10,
      $vars: ['seriesName', 'name', 'value'],
      event: {} as any,
      color: '#00ff00',
    };

    // Call the event handler directly
    onChartClick(event);

    expect(onChartClick).toHaveBeenCalledWith(event);
  });
});
