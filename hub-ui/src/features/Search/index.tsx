/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import { ActionIcon, Group, Popover, Stack, Text, Title } from "@mantine/core";
import Info from "@/assets/Info";
import SearchIcon from "@/assets/Search";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Search/Search.module.css";
import mainManager from "@/managers/Main.init";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";
import { CollectionType, getCollectionType } from "@/utils/collection";
import { Entry } from "./Entry";

const Search: React.FC = () => {
  const layers = useMainStore((state) => state.layers).filter((layer) =>
    [CollectionType.EDR, CollectionType.Features].includes(
      getCollectionType(mainManager.getCollection(layer.collectionId)!),
    ),
  );

  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const [show, setShow] = useState(false);

  const handleShow = (show: boolean) => {
    setOverlay(show ? EOverlay.Search : null);
    setShow(show);
  };

  useEffect(() => {
    if (overlay !== EOverlay.Search) {
      setShow(false);
    }
  }, [overlay]);

  const helpText = (
    <>
      <Text size="sm">placeholder.</Text>
    </>
  );

  if (layers.length === 0) {
    return null;
  }

  return (
    <Popover
      opened={show}
      onChange={setShow}
      position="right-start"
      closeOnClickOutside={false}
    >
      <Popover.Target>
        <Tooltip label="Search collections" disabled={show}>
          <ActionIcon autoContrast size="lg" onClick={() => handleShow(!show)}>
            <SearchIcon />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Tooltip multiline label={helpText}>
          <Group className={styles.title} gap="xs" mb="var(--default-spacing)">
            <Title order={4} size="h5">
              Search
            </Title>
            <Info />
          </Group>
        </Tooltip>

        <Stack
          gap={0}
          className={`${styles.container} ${styles.dateSelectorContainer}`}
          align="flex-start"
        >
          {layers.map((layer) => (
            <Entry key={`layer-order-${layer.id}`} layer={layer} />
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default Search;
