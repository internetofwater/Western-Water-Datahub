/**
 * Copyright 2026 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import wwdhService from '@/services/init/wwdh.init';
import { Anchor, Divider, Group } from '@mantine/core';
import { Fragment, useEffect, useRef, useState } from 'react';

type Props = {
    collectionId: string;
};

export const Links: React.FC<Props> = (props) => {
    const { collectionId } = props;

    const [sourceLink, setSourceLink] = useState('');
    const [documentationLink, setDocuLink] = useState('');

    const isMounted = useRef(true);
    const controller = useRef<AbortController>(null);

    const getLinks = async (collectionId: string) => {
        try {
            controller.current = new AbortController();

            const id = collectionId.replace('dash-', '');

            const collection = await wwdhService.getCollection(id, {
                signal: controller.current.signal,
            });

            if (collection) {
                // const collectionLink =
                // collection.links.find(
                //   (link) => link.rel === "alternate" && link.type === "text/html",
                // )?.href ?? "";
                const sourceLink =
                    collection.links.find((link) => link.rel === 'canonical')
                        ?.href ?? '';
                const documentationLink =
                    collection.links.find(
                        (link) => link.rel === 'documentation'
                    )?.href ?? '';
                if (isMounted.current) {
                    setSourceLink(sourceLink);
                    setDocuLink(documentationLink);
                }
            }
        } catch (error) {
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
        }
    };

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            if (controller.current) {
                controller.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        void getLinks(collectionId);
    }, [collectionId]);
    const links = [
        // { label: "API", href: collectionLink, title: "This dataset in the API" },
        {
            label: 'Source',
            href: sourceLink,
            title: 'Original source of pre-transformed data',
        },
        {
            label: 'Methodology',
            href: documentationLink,
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
