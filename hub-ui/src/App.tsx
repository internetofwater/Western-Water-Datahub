/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@/global.css";

import { Providers } from "@/providers";
import { LayoutPage } from "./pages/Layout.page";

/**
 * This component renderes the router and wraps it in the map and mantine providers.
 *
 * @component
 */
export default function App() {
  return (
    <Providers>
      <LayoutPage />
    </Providers>
  );
}
