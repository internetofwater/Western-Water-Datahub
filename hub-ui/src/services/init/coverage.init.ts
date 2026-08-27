/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import notificationManager from '@/managers/Notification.init';
import { CoverageChartService } from '@/services/coverageJSON/coverageChart.service';

export const coverageChartService = new CoverageChartService({ notificationManager });
