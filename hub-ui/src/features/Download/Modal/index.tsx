/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment } from 'react/jsx-runtime';
import { Divider, Modal as ModalComponent, Title } from '@mantine/core';
import Collection from '@/features/Download/Modal/Collection';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { Modal as ModalEnum } from '@/stores/session/types';
import { groupLocationIdsByCollection } from '@/utils/groupLocationsByCollection';

const Modal: React.FC = () => {
  const openModal = useSessionStore((state) => state.openModal);
  const setOpenModal = useSessionStore((state) => state.setOpenModal);
  const locations = useMainStore((state) => state.locations);

  const locationsByCollections = groupLocationIdsByCollection(locations);

  return (
    <ModalComponent
      opened={openModal === ModalEnum.Download}
      closeButtonProps={{ 'aria-label': 'Close download modal' }}
      onClose={() => setOpenModal(null)}
      title={
        <Title order={3} size="h4">
          Download
        </Title>
      }
      size="xl"
    >
      {locationsByCollections &&
        Object.entries(locationsByCollections).map(([collectionId, locationIds]) => (
          <Fragment key={`collection-download-${collectionId}`}>
            <Collection
              collectionId={collectionId}
              locationIds={locationIds}
              open={Object.keys(locationsByCollections).length === 1}
            />
            {Object.keys(locationsByCollections).length > 1 && <Divider />}
          </Fragment>
        ))}
    </ModalComponent>
  );
};

export default Modal;
