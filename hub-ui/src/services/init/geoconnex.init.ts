/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { EDRService } from '@/services/edr.service';

const geoconnexService = new EDRService({
  baseUrl: 'https://reference.geoconnex.us/',
});

export default geoconnexService;
