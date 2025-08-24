import { PropsWithChildren } from 'react';
import {
  Box,
  HoverCard,
  HoverCardDropdown,
  HoverCardTarget,
  List,
  ListItem,
  Text,
  Title,
} from '@mantine/core';

type Props = {
  loadingTexts: string[];
};

export const Info: React.FC<PropsWithChildren<Props>> = (props) => {
  const { loadingTexts, children } = props;

  return (
    <HoverCard width={260} shadow="md" position="top" withArrow>
      <HoverCardTarget>
        <Box w="100%">{children}</Box>
      </HoverCardTarget>
      <HoverCardDropdown>
        <Title order={4}>Loading:</Title>
        <List>
          {loadingTexts.map((item, index) => (
            <ListItem key={index}>
              <Text size="sm">{item}</Text>
            </ListItem>
          ))}
        </List>
      </HoverCardDropdown>
    </HoverCard>
  );
};
