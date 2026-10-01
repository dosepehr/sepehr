'use client';

import { cn } from '@/lib/funcs/cn';
import { cloneElement } from 'react';
import { Marker, MarkerContent, MarkerIcon } from './components';
import type { MarkerWrapperProps } from './marker.types';

const MarkerWrapper = ({
    variant = 'default',
    icon,
    children,
    iconClassName,
    contentClassName,
    shimmer = false,
    render,
    ...props
}: MarkerWrapperProps) => {
    const content = (
        <>
            {icon && <MarkerIcon className={iconClassName}>{icon}</MarkerIcon>}
            {children && (
                <MarkerContent
                    className={cn(shimmer && 'shimmer', contentClassName)}
                >
                    {children}
                </MarkerContent>
            )}
        </>
    );

    if (render) {
        return (
            <Marker variant={variant} {...props}>
                {cloneElement(render, undefined, content)}
            </Marker>
        );
    }

    return (
        <Marker variant={variant} {...props}>
            {content}
        </Marker>
    );
};

export default MarkerWrapper;
