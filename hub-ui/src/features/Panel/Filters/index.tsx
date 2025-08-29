/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Category } from './Category';
import { Dataset } from './Dataset';
import Location from './Location';
import { Provider } from './Provider';

const Filters: React.FC = () => {
  return (
    <>
      <Provider />
      <Category />
      <Dataset />
      <Location />
    </>
  );
};

export default Filters;
