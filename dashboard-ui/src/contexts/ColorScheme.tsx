/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { createContext, Dispatch, SetStateAction } from "react";

export default createContext<{
  colorScheme: string;
  onChange: Dispatch<SetStateAction<string>>;
} | null>(null);
