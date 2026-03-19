/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Group, Radio } from "@mantine/core";
import Geography from "@/features/Panel/Filters/Geography";
import styles from "@/features/Panel/Panel.module.css";

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
    <Radio.Group
      size="xs"
      name="geographySelector"
      value={geography}
      onChange={onChange}
    >
      <Group mt="xs" gap="calc(var(--default-spacing) * 2)">
        {geographies.map((option) => (
          <Radio
            key={`geography-selector-${option.value}`}
            classNames={{
              body: styles.radioBody,
              label: styles.radioLabel,
            }}
            value={option.value}
            label={option.label}
          />
        ))}
      </Group>
    </Radio.Group>
  );
};
