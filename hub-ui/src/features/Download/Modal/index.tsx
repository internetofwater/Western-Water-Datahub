import { Modal as _Modal } from '@mantine/core';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { groupLocationIdsByCollection } from '@/utils/groupLocationsByCollection';
import { Collection } from './Collection';

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
          <Collection collectionId={collectionId} locationIds={locationIds} />
        ))}
    </_Modal>
  );
};

export default Modal;
