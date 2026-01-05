/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { Feature } from "geojson";
// import { Box, ScrollArea } from '@mantine/core';
import Code from "@/components/Code";

type Props = {
  location: Feature;
};

export const GeoJSON: React.FC<Props> = (props) => {
  const { location } = props;

  const display = JSON.stringify(
    {
      ...location,
      geometry: "...",
    },
    null,
    2,
  );

  const code = JSON.stringify(location, null, 2);

  return <Code size="sm" display={display} code={code} />;
};
