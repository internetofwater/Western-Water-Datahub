/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import WarningManager from '@/managers/Warning.manager';
import useSessionStore from '@/stores/session';

const warningManager = new WarningManager(useSessionStore);

export default warningManager;
