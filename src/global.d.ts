import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                'ios-src'?: string;
                alt?: string;
                ar?: boolean;
                'ar-modes'?: string;
                'camera-controls'?: boolean;
                'ar-scale'?: string;
                'ar-placement'?: string;
                'shadow-intensity'?: string;
                'environment-image'?: string;
                loading?: string;
                ref?: any;
            }, HTMLElement>;
        }
    }
}
