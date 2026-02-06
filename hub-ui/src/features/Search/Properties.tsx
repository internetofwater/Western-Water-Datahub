/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { GeoJsonProperties } from "geojson";
import { ActionIcon, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { Table } from "@/features/Table";

type Props = {
  properties: GeoJsonProperties;
};

export const Properties: React.FC<Props> = (props) => {
  const { properties } = props;

  const [showTable, setShowTable] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  useEffect(() => {
    setList(Object.keys(properties ?? {}));
  }, [properties]);

  const getMoreLabel = () => {
    return Math.min(5, list.length - count);
  };

  const handleShow = () => {
    setShowTable(!showTable);
  };

  const handleMore = () => {
    setCount(Math.min(count + 5, list.length));
  };

  const handleLess = () => {
    setCount(Math.max(count - 5, 5));
  };

  const showMore = list.length > count;
  const showLess = count > 5;

  return (
    <>
      {!showTable && (
        <>
          <Text size="sm" fw={700} mt="var(--default-spacing)">
            Properties:
          </Text>
          <Text size="xs"> {list.slice(0, count).join(", ")}</Text>
          <Divider />
          <Group justify="space-between" align="flex-end">
            <Text size="sm">{list.length} properties in total</Text>
            <Stack gap={0}>
              <Text size="xs" fw={700}>
                Show More:
              </Text>
              <Group gap="calc(var(--default-spacing) * 1.35)">
                {showMore && (
                  <ActionIcon size="sm" onClick={handleMore}>
                    <Text size="xs">+ {getMoreLabel()}</Text>
                  </ActionIcon>
                )}
                {showMore && showLess && <Divider orientation="vertical" />}
                {showLess && (
                  <ActionIcon size="sm" onClick={handleLess}>
                    <Text size="xs">- 5</Text>
                  </ActionIcon>
                )}
              </Group>
            </Stack>
          </Group>
        </>
      )}

      <Button onClick={handleShow} size="xs" mt="var(--default-spacing)">
        {showTable ? "Hide Sample Feature" : "Show Sample Feature"}
      </Button>
      {showTable && <Table properties={properties} search size="xs" />}
    </>
  );
};
