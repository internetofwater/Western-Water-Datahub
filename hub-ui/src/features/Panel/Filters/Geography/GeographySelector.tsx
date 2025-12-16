/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import Geography from ".";
import { Group, Radio } from "@mantine/core";

type Props = {
  geography: Geography;
  onChange: (value: string) => void;
};

const geographies: Array<{ value: Geography; label: string }> = [
  {
    value: "region",
    label: "Region",
  },
  {
    value: "basin",
    label: "Basin",
  },
  {
    value: "state",
    label: "State",
  },
];

export const GeographySelector: React.FC<Props> = (props) => {
  const { geography, onChange } = props;

  return (
    <Radio.Group name="geographySelector" value={geography} onChange={onChange}>
      <Group mt="xs">
        {geographies.map((option) => (
          <Radio
            key={`geography-selector-${option.value}`}
            value={option.value}
            label={option.label}
          />
        ))}
      </Group>
    </Radio.Group>
  );
};
