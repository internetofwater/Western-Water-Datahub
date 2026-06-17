/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Properties } from '@/components/Map/types';
import { ReservoirConfigProperties } from '@/features/Map/types';

export const isDataValid = (
    reservoirProperties: Properties,
    config: ReservoirConfigProperties
): boolean => Boolean(reservoirProperties[config.storageProperty]);
