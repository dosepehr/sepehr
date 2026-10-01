'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Progress as ProgressPrimitive } from 'radix-ui';
import * as React from 'react';

export const progressVariants = cva(
    'h-full w-full flex-1 transition-all duration-300 ease-in-out',
    {
        variants: {
            variant: {
                default: 'bg-primary',
                success: 'bg-success',
                warning: 'bg-warning',
                destructive: 'bg-destructive',
                info: 'bg-info',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const trackVariants = cva('relative h-2 w-full overflow-hidden rounded-full', {
    variants: {
        variant: {
            default: 'bg-primary/20',
            success: 'bg-success/20',
            warning: 'bg-warning/20',
            destructive: 'bg-destructive/20',
            info: 'bg-info/20',
        },
    },
    defaultVariants: { variant: 'default' },
});

const Progress = ({
    className,
    value,
    variant,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
    VariantProps<typeof progressVariants>) => {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            data-variant={variant}
            className={cn(trackVariants({ variant }), className)}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(progressVariants({ variant }))}
                style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
};

export default Progress;
