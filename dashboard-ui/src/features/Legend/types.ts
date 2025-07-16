/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { LayerType } from '@/components/Map/types';
import { LayerId } from '@/features/Map/consts';

export type Id =
    | LayerId.Snotel
    | LayerId.NOAARiverForecast
    | LayerId.USDroughtMonitor
    | LayerId.NOAAPrecipSixToTen
    | LayerId.NOAATempSixToTen;

export type Entry = {
    id: Id;
    type: LayerType;
    items?: { color: string; label: string }[];
    colors?: string[];
    from?: string | number;
    to?: string | number;
};
