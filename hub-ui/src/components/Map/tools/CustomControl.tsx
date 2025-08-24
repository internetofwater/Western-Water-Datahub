/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Map } from 'mapbox-gl';
import { createRoot, Root } from 'react-dom/client';

class CustomControl {
  _component: React.ReactNode;
  _map: Map | null = null;
  _container: HTMLElement | null = null;
  _root: Root | null = null;

  constructor(component: React.ReactNode) {
    this._component = component;
  }

  onAdd(map: Map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._root = createRoot(this._container);
    this._root.render(this._component);
    return this._container;
  }

  onRemove() {
    if (this._root) {
      setTimeout(() => {
        this._root?.unmount();
      }, 0);
    }
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = null;
  }
}
export default CustomControl;
