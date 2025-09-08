/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

const DashedLine: React.FC = () => {
    return (
        <svg viewBox="0 0 30 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line
                y1="2.5"
                x2="30"
                y2="2.5"
                stroke="#D0A02A"
                strokeWidth="5"
                strokeDasharray="5 3"
            />
        </svg>
    );
};

export default DashedLine;
