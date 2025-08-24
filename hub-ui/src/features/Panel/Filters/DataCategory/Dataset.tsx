import { Select } from '@mantine/core';

export const Dataset: React.FC = () => {
  return (
    <Select
      size="xs"
      label="Dataset"
      placeholder="Select..."
      data={['React', 'Angular', 'Vue', 'Svelte']}
      searchable
    />
  );
};
