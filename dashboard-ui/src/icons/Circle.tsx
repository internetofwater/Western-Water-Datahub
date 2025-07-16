import React from 'react';

type Props = {
    color: string;
};

const CircleIcon: React.FC<Props> = ({ color = 'black' }) => (
    <svg
        height="30"
        width="30"
        role="img"
        aria-labelledby="icon-title-circle icon-desc-circle"
    >
        <title id="icon-title-circle">Circle Icon</title>
        <desc id="icon-desc-circle">
            A circle icon used in the legend to indicate a point layer
        </desc>
        <circle cx="15" cy="15" r="10" fill={color} />
    </svg>
);

export default CircleIcon;
