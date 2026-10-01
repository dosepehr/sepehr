'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva } from 'class-variance-authority';
import { Slider as SliderPrimitive } from 'radix-ui';
import type { SliderProps } from './slider.types';

const trackVariants = cva(
    'relative h-1.5 w-full grow overflow-hidden rounded-full',
    {
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
    },
);

export const rangeVariants = cva('absolute h-full', {
    variants: {
        variant: {
            default: 'bg-primary',
            success: 'bg-success',
            warning: 'bg-warning',
            destructive: 'bg-destructive',
            info: 'bg-info',
        },
    },
    defaultVariants: { variant: 'default' },
});

const thumbVariants = cva(
    'block size-4 rounded-full border-2 bg-background shadow-sm transition-[color,box-shadow] outline-none data-[disabled]:pointer-events-none',
    {
        variants: {
            variant: {
                default:
                    'border-primary focus-visible:ring-3 focus-visible:ring-primary/50',
                success:
                    'border-success focus-visible:ring-3 focus-visible:ring-success/50',
                warning:
                    'border-warning focus-visible:ring-3 focus-visible:ring-warning/50',
                destructive:
                    'border-destructive focus-visible:ring-3 focus-visible:ring-destructive/50',
                info: 'border-info focus-visible:ring-3 focus-visible:ring-info/50',
            },
        },
        defaultVariants: { variant: 'default' },
    },
);

const Slider = ({
    className,
    variant,
    defaultValue,
    'aria-label': ariaLabel,
    ...props
}: SliderProps) => {
    const thumbCount = (defaultValue ?? props.value ?? [0]).length;
    const thumbLabels = Array.isArray(ariaLabel) ? ariaLabel : [ariaLabel];

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            data-variant={variant}
            defaultValue={defaultValue}
            className={cn(
                'relative flex w-full touch-none items-center select-none',
                'data-disabled:cursor-not-allowed data-disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <SliderPrimitive.Track
                data-slot="slider-track"
                className={trackVariants({ variant })}
            >
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={rangeVariants({ variant })}
                />
            </SliderPrimitive.Track>
            {Array.from({ length: thumbCount }).map((_, i) => (
                <SliderPrimitive.Thumb
                    key={i}
                    data-slot="slider-thumb"
                    aria-label={thumbLabels[i] ?? thumbLabels[0]}
                    className={thumbVariants({ variant })}
                />
            ))}
        </SliderPrimitive.Root>
    );
};

export default Slider;
