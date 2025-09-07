/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Fragment } from 'react/jsx-runtime';
import { Modal as _Modal, Divider } from '@mantine/core';
import Collection from '@/features/Download/Modal/Collection/Collection';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { groupLocationIdsByCollection } from '@/utils/groupLocationsByCollection';

const Modal: React.FC = () => {
  const downloadModalOpen = useSessionStore((state) => state.downloadModalOpen);
  const setDownloadModalOpen = useSessionStore((state) => state.setDownloadModalOpen);
  const locations = useMainStore((state) => state.locations);

  const locationsByCollections = groupLocationIdsByCollection(locations);

  return (
    <_Modal
      opened={downloadModalOpen}
      onClose={() => setDownloadModalOpen(false)}
      title="Download"
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
    </_Modal>
  );
};

export default Modal;
