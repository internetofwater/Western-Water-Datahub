/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Box } from '@mantine/core';
import LegendTool from '@/features/Map/Tools/Legend';
import styles from '@/features/Map/Tools/Tools.module.css';
import useSessionStore from '@/stores/session';
import { Tool } from '@/stores/session/types';

const MapTools: React.FC = () => {
  const tools = useSessionStore((state) => state.tools);

  return (
    <Box className={`${styles.mapToolsContainer} ${styles.right}`}>
      <Box component="span" style={{ display: tools[Tool.Legend] ? 'block' : 'none' }}>
        <LegendTool />
      </Box>
    </Box>
  );
};

export default MapTools;
