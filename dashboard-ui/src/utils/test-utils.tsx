/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MapProvider } from "@/contexts/MapContexts";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MapProvider mapIds={["test"]}>{children}</MapProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
