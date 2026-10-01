import type { VariantProps } from 'class-variance-authority';
import type { Slider as SliderPrimitive } from 'radix-ui';
import type * as React from 'react';
import { type rangeVariants } from '.';

export type SliderProps = Omit<
    React.ComponentProps<typeof SliderPrimitive.Root>,
    'aria-label'
> &
    VariantProps<typeof rangeVariants> & {
        /** Accessible name for the thumb(s). Pass an array to label each thumb of a range slider individually. */
        'aria-label'?: string | string[];
    };
