/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapComponent from "@/components/Map/ClientSide";
import mapboxglMock, { LngLatLike } from "mapbox-gl";
import { render } from "@/utils/test-utils";
import {
  addClickFunctions,
  addHoverFunctions,
  addLayers,
  addSources,
  addControls,
} from "../utils";

jest.mock("mapbox-gl");
jest.mock("../utils", () => ({
  addSources: jest.fn(),
  addLayers: jest.fn(),
  addHoverFunctions: jest.fn(),
  addClickFunctions: jest.fn(),
  addMouseMoveFunctions: jest.fn(),
  addControls: jest.fn(),
}));
describe("Map Component: ClientSide", () => {
  test("renders MapComponent", async () => {
    const div = document.createElement("div");
    div.setAttribute("data-testid", "map-container-test");
    div.setAttribute("id", "map-container-test");
    const props = {
      accessToken: "fake-access-token",
      id: "test",
      sources: [],
      layers: [],
      options: {
        container: div,
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 1,
        center: [0, 0] as LngLatLike,
        testMode: true,
      },
    };

    render(<MapComponent {...props} />);
    const mapElement = screen.getByTestId("map-container-test");
    expect(mapElement).toBeInTheDocument();

    await waitFor(() => {
      expect(mapboxglMock.Map).toHaveBeenCalledWith(
        expect.objectContaining({
          container: props.options.container,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [0, 0],
          zoom: 1,
          testMode: true,
        }),
      );

      expect(addSources).toHaveBeenCalled();
      expect(addLayers).toHaveBeenCalled();
      expect(addHoverFunctions).toHaveBeenCalled();
      expect(addClickFunctions).toHaveBeenCalled();
      expect(addControls).toHaveBeenCalled();
    });
  });
});
