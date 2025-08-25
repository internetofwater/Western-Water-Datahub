/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import CopyInput from '@/components/CopyInput';

export default {
  title: 'CopyInput',
};

export const Usage = () => (
  <CopyInput url="https://api.com?coords=POLYGON(...)&datetime=2020-02-03/2021-02-03" />
);
