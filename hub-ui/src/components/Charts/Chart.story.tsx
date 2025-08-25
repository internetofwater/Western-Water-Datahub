/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { ECElementEvent } from 'echarts/core';
import { FeatureCollection, Point } from 'geojson';
import { Box } from '@mantine/core';
import BarChart from '@/components/Charts/BarChart';
import RadarChart from '@/components/Charts/RadarChart';

export default {
  title: 'Charts',
};

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

export const Bar = () => (
  <Box w="300px" h="200px" m="auto">
    <BarChart
      title="Chart Title"
      onChartClick={(event: ECElementEvent) => {
        // eslint-disable-next-line no-alert
        alert('Check the console to see this click event!');
        console.log(event);
      }}
      series={[
        {
          name: 'Clickable Series',
          data: mockData,
          labelProperty: 'name',
          valueProperty: 'value',
          idProperty: 'id',
          color: '#8C1D40',
        },
      ]}
    />
  </Box>
);

export const Radar = () => (
  <Box w="300px" h="200px" m="auto">
    <RadarChart
      series={[
        {
          name: 'Series A',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { name: 'Item 1', a: 100, b: 400, c: 800 },
                geometry: { type: 'Point', coordinates: [0, 0] },
              },
              {
                type: 'Feature',
                properties: { name: 'Item 2', a: 150, b: 250, c: 50 },
                geometry: { type: 'Point', coordinates: [0, 0] },
              },
            ],
          },
        },
        {
          name: 'Series B',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { name: 'Item 1', a: 200, b: 600, c: 1200 },
                geometry: { type: 'Point', coordinates: [0, 0] },
              },
              {
                type: 'Feature',
                properties: { name: 'Item 2', a: 250, b: 350, c: 150 },
                geometry: { type: 'Point', coordinates: [0, 0] },
              },
            ],
          },
        },
      ]}
      properties={['a', 'b', 'c']}
      title="Test Radar"
    />
  </Box>
);
