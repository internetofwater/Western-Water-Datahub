/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

type Props = {
  color: string;
};

const Line: React.FC<Props> = ({ color = 'black' }) => (
  <svg height="10" width="26" role="img" aria-labelledby="icon-title-line icon-desc-line">
    <title id="icon-title-line">line Icon</title>
    <desc id="icon-desc-line">A line icon used in the legend to indicate a line layer</desc>
    <line x1="0" y1="5" x2="24" y2="5" stroke={color} strokeWidth="6" />
  </svg>
);

export default Line;
