/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

type Props = {
    html: string;
};

export const SnotelPopup: React.FC<Props> = (props) => {
    const { html } = props;

    return <iframe src={html} loading="lazy" />;
};
