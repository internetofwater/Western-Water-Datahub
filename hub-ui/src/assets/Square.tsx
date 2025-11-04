/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

type Props = {
  fill: string;
  stroke?: string;
  width?: number;
  height?: number;
};

const FilledSquare: React.FC<Props> = (props) => {
  const { fill = 'black', stroke, width = 24, height = 24 } = props;

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-labelledby="icon-title-square icon-desc-square"
    >
      <title id="icon-title-square">Square Icon</title>
      <desc id="icon-desc-square">
        A square icon used in the legend to indicate a polygon layer
      </desc>
      <rect
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.5}
        stroke={stroke ?? fill}
        strokeWidth={6}
      />
    </svg>
  );
};

export default FilledSquare;
