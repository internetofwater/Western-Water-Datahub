/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { GeoJsonProperties } from "geojson";
import { Table as TableComponent, Text, TextInput } from "@mantine/core";
import styles from "@/features/Popup/Popup.module.css";

type Props = {
  properties: GeoJsonProperties;
  size?: string;
  search?: boolean;
};

export const Table: React.FC<Props> = (props) => {
  const { properties, size = "sm", search = false } = props;

  const [filteredProperties, setFilteredProperties] =
    useState<GeoJsonProperties>(properties);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredProperties(properties);
    }

    const lower = searchTerm.toLowerCase();
    const filtered = Object.fromEntries(
      Object.entries(properties ?? {}).filter(
        ([key, value]) =>
          key.toLowerCase().includes(lower) ||
          String(value).toLowerCase().includes(lower),
      ),
    );

    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  return (
    <>
      {search && (
        <TextInput
          size="xs"
          label="Search Table"
          placeholder="Search property names and values"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          mb="var(--default-spacing)"
        />
      )}
      <TableComponent
        striped
        stickyHeader
        withTableBorder
        withColumnBorders
        className={styles.table}
      >
        <TableComponent.Thead>
          <TableComponent.Tr>
            <TableComponent.Th>
              <Text size={size} fw={700}>
                Property
              </Text>
            </TableComponent.Th>
            <TableComponent.Th>
              <Text size={size} fw={700}>
                Value
              </Text>
            </TableComponent.Th>
          </TableComponent.Tr>
        </TableComponent.Thead>
        <TableComponent.Tbody>
          {Object.entries(filteredProperties ?? {}).map(([property, value]) => (
            <TableComponent.Tr key={property}>
              <TableComponent.Td className={styles.propertyColumn}>
                <Text size={size} lineClamp={1}>
                  {property}
                </Text>
              </TableComponent.Td>
              <TableComponent.Td>
                <Text size={size} lineClamp={2}>
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : value}
                </Text>
              </TableComponent.Td>
            </TableComponent.Tr>
          ))}
        </TableComponent.Tbody>
      </TableComponent>
    </>
  );
};
