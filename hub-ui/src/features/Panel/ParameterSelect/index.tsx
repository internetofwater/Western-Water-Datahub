import { Group, Stack, Text, Title, VisuallyHidden } from '@mantine/core';
import Info from '@/assets/Info';
import Tooltip from '@/components/Tooltip';
import styles from '@/features/Panel/Panel.module.css';
import useMainStore from '@/stores/main';
import ParameterSelect from './ParameterSelect';

const ParameterSelectWrapper: React.FC = () => {
  const selectedCollections = useMainStore((state) => state.selectedCollections);

  const helpText = (
    <>
      <Text size="sm">
        Parameters are scientific measurements contained by collections that are associated with
        specific locations and times.
      </Text>
      <br />
      <Text size="sm">
        Selecting one or more parameters will show locations on the map that contain at least one
        measurement for that parameter.
      </Text>
    </>
  );

  return (
    <Stack gap={0}>
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h3">
            Filter by Parameter
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      {selectedCollections.length > 0 ? (
        selectedCollections.map((collectionId) => (
          <ParameterSelect key={`parameter-select-${collectionId}`} collectionId={collectionId} />
        ))
      ) : (
        <Text size="sm" color="dimmed">
          Select at least one collection to show parameter selects.
        </Text>
      )}
    </Stack>
  );
};

export default ParameterSelectWrapper;
