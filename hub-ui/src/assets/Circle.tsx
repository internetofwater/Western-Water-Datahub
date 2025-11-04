/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

type Props = {
  fill: string;
  stroke?: string;
};

const CircleIcon: React.FC<Props> = ({ fill = '#000', stroke = '#000' }) => (
  <svg height="24" width="24" role="img" aria-labelledby="icon-title-circle icon-desc-circle">
    <title id="icon-title-circle">Circle Icon</title>
    <desc id="icon-desc-circle">A circle icon used in the legend to indicate a point layer</desc>
    <circle cx="12" cy="12" r="10" fill={fill} stroke={stroke} strokeWidth={2} />
  </svg>
);

export default CircleIcon;
