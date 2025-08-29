/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Legend from '@/assets/Legend';
import useSessionStore from '@/stores/session';
import { Tools } from '@/stores/session/types';

/**
 *
 * @component
 */
export const MapButton: React.FC = () => {
  const tools = useSessionStore((state) => state.tools);
  const setOpenTools = useSessionStore((state) => state.setOpenTools);

  const onClick = () => {
    setOpenTools(Tools.Legend, !tools[Tools.Legend]);
  };

  return (
    <button
      type="button"
      aria-label="Show legend"
      aria-disabled="false"
      onClick={onClick}
      style={{ padding: '3px' }}
    >
      <Legend />
    </button>
  );
};
