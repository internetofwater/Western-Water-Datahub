import { Select, Stack, Title } from '@mantine/core';

const Provider: React.FC = () => {
  return (
    <Stack gap={0}>
      <Title order={2} size="h3">
        Filter by Provider
      </Title>
      <Select
        size="xs"
        label="Provider"
        placeholder="Select..."
        data={['React', 'Angular', 'Vue', 'Svelte']}
        searchable
      />
    </Stack>
  );
};

export default Provider;
