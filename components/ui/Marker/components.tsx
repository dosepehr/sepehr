'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type {
    MarkerContentProps,
    MarkerIconProps,
    MarkerProps,
} from './marker.types';

const markerVariants = cva(
    'flex w-full items-center gap-2 text-xs text-muted-foreground',
    {
        variants: {
            variant: {
                default: '',
                border: 'border-b border-border pb-3',
                separator:
                    'justify-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const Marker = ({
    variant = 'default',
    asChild = false,
    className,
    ...props
}: MarkerProps) => {
    const Comp = asChild ? Slot.Root : 'div';

    return (
        <Comp
            data-slot="marker"
            data-variant={variant}
            className={cn(markerVariants({ variant }), className)}
            {...props}
        />
    );
};

const MarkerIcon = ({ className, ...props }: MarkerIconProps) => {
    return (
        <span
            data-slot="marker-icon"
            aria-hidden="true"
            className={cn(
                'flex shrink-0 items-center justify-center [&_svg]:size-3.5',
                className,
            )}
            {...props}
        />
    );
};

const MarkerContent = ({ className, ...props }: MarkerContentProps) => {
    return (
        <span
            data-slot="marker-content"
            className={cn('min-w-0 truncate', className)}
            {...props}
        />
    );
};

export { Marker, MarkerContent, MarkerIcon, markerVariants };
