/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Category } from '@/features/Panel/Filters/Category';
import { Collection } from '@/features/Panel/Filters/Collection';

const Filters: React.FC = () => {
  return (
    <>
      {/* <Provider /> */}
      <Category />
      <Collection />
    </>
  );
};

export default Filters;
