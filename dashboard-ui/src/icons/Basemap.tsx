/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

const Basemap: React.FC = () => {
    return (
        <svg
            viewBox="0 0 142 123"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="icon-title-basemap icon-desc-basemap"
        >
            <title id="icon-title-basemap">Basemap Selector Menu</title>
            <desc id="icon-desc-basemap">
                This icon is used in a button to open the basemap selector menu
            </desc>
            <path d="M70.5811 0L90.211 34H50.9512L70.5811 0Z" fill="black" />
            <path
                d="M23.8157 81L41.7136 50H99.4486L117.346 81H23.8157Z"
                fill="black"
            />
            <path
                d="M14.5781 97L0 122.25H141.162L126.584 97H14.5781Z"
                fill="black"
            />
        </svg>
    );
};

export default Basemap;
