/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import DataCategory from '@/features/Panel/Filters/DataCategory';
import Location from '@/features/Panel/Filters/Location';
import Provider from '@/features/Panel/Filters/Provider';
import Time from '@/features/Panel/Filters/Time';

const Filters: React.FC = () => {
  return (
    <>
      <DataCategory />
      <Provider />
      <Location />
      <Time />
    </>
  );
};

export default Filters;
