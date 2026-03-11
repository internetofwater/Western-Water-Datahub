/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Flex, Stack, Text } from '@mantine/core';
import { TGroupEntry } from '@/features/MapTools/Legend/types';
import { Items } from '@/features/MapTools/Legend/Items';

type Props = {
    entry: TGroupEntry;
};

export const Groups: React.FC<Props> = (props) => {
    const { entry } = props;

    return (
        <>
            <Flex
                gap="calc(var(--default-spacing) * 1)"
                justify="flex-start"
                align="flex-start"
                direction={entry.direction === 'horizontal' ? 'row' : 'column'}
                wrap="wrap"
            >
                {entry.groups.map((group, index) => (
                    <Stack gap="calc(var(--default-spacing) / 2)">
                        <Text size="xs">{group.label}</Text>
                        <Items
                            id={`${entry.id}-${index}`}
                            entry={group}
                            direction={group.direction}
                        />
                    </Stack>
                ))}
            </Flex>
        </>
    );
};
