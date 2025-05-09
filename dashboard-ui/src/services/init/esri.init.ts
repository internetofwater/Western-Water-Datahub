/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { RegionsSource } from '@/features/Map/consts';
import { EsriService } from '@/services/esri.service';

const esriService = new EsriService(RegionsSource);

export default esriService;
