/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import wwdhService from '@/services/init/wwdh.init';
import { Anchor, Divider, Group } from '@mantine/core';
import { Fragment, useEffect, useState } from 'react';

export type TManualLinks = {
    apiLink?: string;
    sourceLink?: string;
    documentationLink?: string;
};

type Props = {
    collectionId: string;
    manualLinks?: TManualLinks;
};

export const Links: React.FC<Props> = (props) => {
    const { collectionId, manualLinks = {} } = props;

    const [apiLink, setApiLink] = useState('');
    const [sourceLink, setSourceLink] = useState('');
    const [documentationLink, setDocuLink] = useState('');

    useEffect(() => {
        if (Object.keys(manualLinks).length > 0) {
            return;
        }

        let isMounted = true;

        const controller = new AbortController();

        // Remove dashboard source specifier from source id
        const id = collectionId.replace('dash-', '');

        wwdhService
            .getCollection(id, {
                signal: controller.signal,
            })
            .then((collection) => {
                if (collection) {
                    const apiLink =
                        collection.links.find(
                            (link) =>
                                link.rel === 'alternate' &&
                                link.type === 'text/html'
                        )?.href ?? '';
                    const sourceLink =
                        collection.links.find(
                            (link) => link.rel === 'canonical'
                        )?.href ?? '';
                    const documentationLink =
                        collection.links.find(
                            (link) => link.rel === 'documentation'
                        )?.href ?? '';
                    if (isMounted) {
                        setApiLink(apiLink);
                        setSourceLink(sourceLink);
                        setDocuLink(documentationLink);
                    }
                }
            })
            .catch((error) => {
                if (
                    (error as Error)?.name === 'AbortError' ||
                    (typeof error === 'string' && error === 'Component unmount')
                ) {
                    console.log('Fetch request canceled');
                } else {
                    if ((error as Error)?.message) {
                        const _error = error as Error;
                        console.error(_error);
                    }
                }
            });

        return () => {
            isMounted = false;
            if (controller) {
                controller.abort();
            }
        };
    }, [collectionId]);

    const links = [
        {
            label: 'API',
            href: manualLinks?.apiLink ?? apiLink,
            title: 'This dataset in the API',
        },
        {
            label: 'Source',
            href: manualLinks?.sourceLink ?? sourceLink,
            title: 'Original source of pre-transformed data',
        },
        {
            label: 'Methodology',
            href: manualLinks?.documentationLink ?? documentationLink,
            title: 'The methodology of the original source data',
        },
    ].filter((link) => link.href?.length > 0);

    return (
        <Group gap={'calc(var(--default-spacing) / 2)'}>
            {links.map(({ label, href, title }, index) => (
                <Fragment key={`link-${label}`}>
                    {index > 0 && <Divider orientation="vertical" />}
                    <Anchor
                        target="_blank"
                        href={href}
                        title={title}
                        size="xs"
                        c="#0098c7"
                    >
                        {label}
                    </Anchor>
                </Fragment>
            ))}
        </Group>
    );
};
