import { useState } from 'react';
import { Button, Checkbox, Group, Stack, Text } from '@mantine/core';
import useSessionStore from '@/stores/session';

type Props = {
  showHelp: boolean;
};

export const About: React.FC<Props> = (props) => {
  const { showHelp } = props;

  const setOpenModal = useSessionStore((state) => state.setOpenModal);

  const [showHelpAgain, setShowHelpAgain] = useState(showHelp);

  const handleDontShowClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('click', event.currentTarget, event.currentTarget.checked);
    const { checked } = event.currentTarget;
    if (checked) {
      localStorage.setItem('showHelp', 'false');
      setShowHelpAgain(false);
    } else {
      localStorage.setItem('showHelp', 'true');
      setShowHelpAgain(true);
    }
  };

  return (
    <Stack>
      <Text>This is where we will place the welcome message and application background.</Text>
      <Group justify="space-between">
        <Button onClick={() => setOpenModal(null)}>Continue</Button>
        <Checkbox
          checked={!showHelpAgain}
          onChange={(event) => handleDontShowClick(event)}
          label="Don't show again"
        />
      </Group>
    </Stack>
  );
};
