/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { EDRService } from '@/services/edr.service';

const wwdhService = new EDRService({
  baseUrl: import.meta.env.VITE_WWDH_SOURCE,
});

export default wwdhService;
