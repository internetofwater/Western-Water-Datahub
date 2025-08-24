/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import LoadingManager from '@/managers/Loading.manager';
import useSessionStore from '@/stores/session';

const loadingManager = new LoadingManager(useSessionStore);

export default loadingManager;
