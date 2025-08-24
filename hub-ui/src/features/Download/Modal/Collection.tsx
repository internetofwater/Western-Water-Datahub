import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  ComboboxData,
  Divider,
  Group,
  MultiSelect,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import loadingManager from '@/managers/Loading.init';
import notificationManager from '@/managers/Notification.init';
import { ICollection } from '@/services/edr.service';
import wwdhService from '@/services/init/wwdh.init';
import { Collection as CollectionType } from '@/stores/main/types';
import { NotificationType } from '@/stores/session/types';
import { getParameterNameOptions } from './utils';

type Props = {
  collectionId: CollectionType['id'];
  locationIds: (string | number)[];
  open?: boolean;
};

export const Collection: React.FC<Props> = (props) => {
  const { collectionId, open = false } = props;

  const [opened, { toggle }] = useDisclosure(open);

  const [collection, setCollection] = useState<ICollection>();
  const [parameterNameOptions, setParameterNameOptions] = useState<ComboboxData>();
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const loadingInstance = useRef<string>(null);

  const getBasinOptions = async () => {
    try {
      loadingInstance.current = loadingManager.add(`Fetching data for collection: ${collectionId}`);
      controller.current = new AbortController();

      const collection = await wwdhService.getCollection(collectionId, {
        signal: controller.current.signal,
      });

      if (isMounted.current) {
        setCollection(collection);
        loadingManager.remove(loadingInstance.current);
      }
    } catch (error) {
      if (
        (error as Error)?.name === 'AbortError' ||
        (typeof error === 'string' && error === 'Component unmount')
      ) {
        console.log('Fetch request canceled');
      } else if ((error as Error)?.message) {
        notificationManager.show(`Error: ${(error as Error)?.message}`, NotificationType.Error);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getBasinOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort('Component unmount');
      }
    };
  }, []);

  useEffect(() => {
    if (!collection) {
      return;
    }

    const parameterNameOptions = getParameterNameOptions(collection.parameter_names);

    setParameterNameOptions(parameterNameOptions);
  }, [collection]);

  return (
    <Box>
      {collection && (
        <Box p="lg">
          <Group justify="space-between" mb="sm">
            <Title order={3}>{collection.title}</Title>
            <Button onClick={toggle}>{opened ? 'Hide' : 'Show'}</Button>
          </Group>
          <Collapse in={opened}>
            <Group justify="space-between">
              {parameterNameOptions && (
                <MultiSelect
                  size="sm"
                  label="Parameters"
                  placeholder="Select..."
                  data={parameterNameOptions}
                  value={selectedParameters}
                  onChange={setSelectedParameters}
                  searchable
                  clearable
                />
              )}
              <Group>
                <DatePickerInput label="From" value={from} onChange={setFrom} />
                <DatePickerInput label="To" value={to} onChange={setTo} />
              </Group>
            </Group>
          </Collapse>
        </Box>
      )}
      <Divider />
    </Box>
  );
};
