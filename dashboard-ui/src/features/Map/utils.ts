import { Map } from 'mapbox-gl';

export const loadTeacups = (map: Map) => {
    if (!map.hasImage('default')) {
        map.loadImage('/map-icons/default.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: default.png');
            }
            map.addImage('default', image);
        });
    }
    if (!map.hasImage('teacup-100')) {
        map.loadImage('/map-icons/teacup-100.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-100.png');
            }
            map.addImage('teacup-100', image);
        });
    }
    if (!map.hasImage('teacup-95')) {
        map.loadImage('/map-icons/teacup-95.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-95.png');
            }
            map.addImage('teacup-95', image);
        });
    }
    if (!map.hasImage('teacup-90')) {
        map.loadImage('/map-icons/teacup-90.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-90.png');
            }
            map.addImage('teacup-90', image);
        });
    }
    if (!map.hasImage('teacup-85')) {
        map.loadImage('/map-icons/teacup-85.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-85.png');
            }
            map.addImage('teacup-85', image);
        });
    }
    if (!map.hasImage('teacup-80')) {
        map.loadImage('/map-icons/teacup-80.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-80.png');
            }
            map.addImage('teacup-80', image);
        });
    }
    if (!map.hasImage('teacup-75')) {
        map.loadImage('/map-icons/teacup-75.png', (error, image) => {
            if (error) throw error;
            if (!image) {
                throw new Error('Image not found: teacup-75.png');
            }
            map.addImage('teacup-75', image);
        });
    }
};
