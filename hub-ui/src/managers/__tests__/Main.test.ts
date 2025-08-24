/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore } from 'zustand';
import MainController from '@/managers/Main.manager';
import useMainStore from '@/stores/main';
import { DatasourceType, MainState } from '@/stores/main/types';

describe('MainController', () => {
  let mainController: MainController;
  let store: UseBoundStore<StoreApi<MainState>>;

  const mockDatasource = {
    id: 'test',
    type: DatasourceType.Point,
    name: 'test',
    provider: 'test-provider',
    dateAvailable: new Date().toTimeString(),
    parameters: [],
    category: 'test-category',
    dataset: 'test-dataset',
    dataVisualizations: [],
  };

  beforeEach(() => {
    store = useMainStore;
    mainController = new MainController(store);

    // Reset store state
    store.setState({
      ...store.getState(),
      datasets: [mockDatasource],
      layers: [],
    });
  });

  afterEach(() => {
    store.setState({
      ...store.getState(),
      layers: [],
    });
  });

  test('should create a layer from a valid datasource', () => {
    mainController.createLayer(mockDatasource.id);

    const layers = store.getState().layers;
    expect(layers.length).toBe(1);

    const layer = layers[0];
    expect(layer.datasourceId).toBe(mockDatasource.id);
    expect(layer.name).toBe(`${mockDatasource.provider} ${mockDatasource.name} 1`);
    expect(layer.color).toBe('#fake');
    expect(layer.visible).toBe(true);
  });

  test('should increment layer name based on existing layers from same datasource', () => {
    mainController.createLayer(mockDatasource.id);
    mainController.createLayer(mockDatasource.id);

    const layers = store.getState().layers;
    expect(layers.length).toBe(2);
    expect(layers[1].name).toBe(`${mockDatasource.provider} ${mockDatasource.name} 2`);
  });

  test('should throw an error if datasource is not found', () => {
    expect(() => mainController.createLayer('invalid-id')).toThrow('Error: datasource not found');
  });
});
