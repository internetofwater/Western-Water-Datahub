import { Select } from '@mantine/core';

export const Category: React.FC = () => {
  return (
    <Select
      size="xs"
      label="Category"
      placeholder="Select..."
      data={['React', 'Angular', 'Vue', 'Svelte']}
      searchable
    />
  );
};
