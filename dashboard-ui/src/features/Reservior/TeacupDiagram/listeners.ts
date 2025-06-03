import {
    averageTextId,
    capacityPolygonId,
    capacityTextId,
    storagePolygonId,
    storageTextId,
} from '@/features/Reservior/TeacupDiagram/consts';

/**
 *
 * @function
 */
export const handleStorageEnter = () => {
    const storageElement = document.getElementById(storagePolygonId);
    const storageTextElement = document.getElementById(storageTextId);

    if (storageElement && storageTextElement) {
        storageElement.setAttribute('stroke-width', '2');
        storageTextElement.setAttribute('display', 'inline');
    }
};
/**
 *
 * @function
 */
export const handleStorageLeave = (_showLabels: boolean = false) => {
    if (_showLabels) {
        return;
    }

    const storageElement = document.getElementById(storagePolygonId);
    const storageTextElement = document.getElementById(storageTextId);

    if (storageElement && storageTextElement) {
        storageElement.setAttribute('stroke-width', '0');
        storageTextElement.setAttribute('display', 'none');
    }
};
/**
 *
 * @function
 */
export const handleCapacityEnter = () => {
    const capacityElement = document.getElementById(capacityPolygonId);
    const capacityTextElement = document.getElementById(capacityTextId);

    if (capacityElement && capacityTextElement) {
        capacityTextElement.setAttribute('display', 'inline');
    }
};
/**
 *
 * @function
 */
export const handleCapacityLeave = (_showLabels: boolean = false) => {
    if (_showLabels) {
        return;
    }
    const capacityElement = document.getElementById(capacityPolygonId);
    const capacityTextElement = document.getElementById(capacityTextId);

    if (capacityElement && capacityTextElement) {
        capacityElement.setAttribute('stroke-width', '0');
        capacityTextElement.setAttribute('display', 'none');
    }
};
/**
 *
 * @function
 */

export const handleAverageLineEnter = () => {
    const averageTextElement = document.getElementById(averageTextId);

    if (averageTextElement) {
        averageTextElement.setAttribute('display', 'inline');
    }
};
/**
 *
 * @function
 */
export const handleAverageLineLeave = (_showLabels: boolean = false) => {
    if (_showLabels) {
        return;
    }

    const averageTextElement = document.getElementById(averageTextId);

    if (averageTextElement) {
        averageTextElement.setAttribute('display', 'none');
    }
};
