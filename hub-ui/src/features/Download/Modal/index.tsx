/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { Fragment } from "react/jsx-runtime";
import { Divider, Modal as ModalComponent, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Collection from "@/features/Download/Modal/Collection";
import useMainStore from "@/stores/main";
import useSessionStore from "@/stores/session";
import { EOverlay } from "@/stores/session/types";
import { groupLocationIdsByCollection } from "@/utils/groupLocationsByCollection";

const Modal: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false, {
    onClose: () => {
      setOverlay(null);
      setLinkLocation(null);
    },
  });
  const overlay = useSessionStore((store) => store.overlay);
  const setOverlay = useSessionStore((store) => store.setOverlay);
  const setLinkLocation = useSessionStore((store) => store.setLinkLocation);

  const locations = useMainStore((state) => state.locations);

  const layers = useMainStore((state) => state.layers);

  const locationsByCollections = groupLocationIdsByCollection(locations);

  useEffect(() => {
    if (overlay !== EOverlay.Download) {
      close();
    } else if (!opened) {
      open();
    }
  }, [overlay]);

  return (
    <ModalComponent
      opened={opened}
      onClose={close}
      closeButtonProps={{ "aria-label": "Close download modal" }}
      title={
        <Title order={3} size="h4">
          Download
        </Title>
      }
      size="1200px"
    >
      {layers.map((layer) => (
        <Fragment key={`collection-download-${layer.collectionId}`}>
          <Collection
            layer={layer}
            open={Object.keys(locationsByCollections).length === 1}
          />
          {Object.keys(locationsByCollections).length > 1 && <Divider />}
        </Fragment>
      ))}
    </ModalComponent>
  );
};

export default Modal;
