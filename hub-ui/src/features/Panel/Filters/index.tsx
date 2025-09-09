/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Category } from "@/features/Panel/Filters/Category";
import { Collection } from "@/features/Panel/Filters/Collection";
import Geography from "@/features/Panel/Filters/Geography";
import { Provider } from "@/features/Panel/Filters/Provider";

const Filters: React.FC = () => {
  return (
    <>
      <Provider />
      <Category />
      <Collection />
      <Geography />
    </>
  );
};

export default Filters;
