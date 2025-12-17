import { useEffect, useState } from 'react';
import { ActionIcon, Group, Popover, Stack, Text, Title } from '@mantine/core';
import Info from '@/assets/Info';
import OrderIcon from '@/assets/Order';
import Tooltip from '@/components/Tooltip';
import { Entry } from '@/features/Order/Entry';
import styles from '@/features/Order/Order.module.css';
import useMainStore from '@/stores/main';
import useSessionStore from '@/stores/session';
import { EOverlay } from '@/stores/session/types';

const Order: React.FC = () => {
  const layers = useMainStore((state) => state.layers);

  const overlay = useSessionStore((state) => state.overlay);
  const setOverlay = useSessionStore((state) => state.setOverlay);

  const [show, setShow] = useState(false);

  const handleShow = (show: boolean) => {
    setOverlay(show ? EOverlay.Order : null);
    setShow(show);
  };

  useEffect(() => {
    if (overlay !== EOverlay.Order) {
      setShow(false);
    }
  }, [overlay]);

  const helpText = (
    <>
      <Text size="sm">Layers are drawn onto the map in the order listed below.</Text>
      <br />
      <Text size="sm">Use the arrow buttons to move layers up or down in the draw order.</Text>
    </>
  );

  if (layers.length === 0) {
    return null;
  }

  return (
    <Popover opened={show} onChange={setShow} position="bottom-start" closeOnClickOutside={false}>
      <Popover.Target>
        <Tooltip label="Reorder layer" disabled={show}>
          <ActionIcon autoContrast size="lg" onClick={() => handleShow(!show)}>
            <OrderIcon />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Tooltip multiline label={helpText}>
          <Group className={styles.title} gap="xs" mb="var(--default-spacing)">
            <Title order={4} size="h5">
              Layer Ordering
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

export default Order;
