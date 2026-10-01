import type { VariantProps } from 'class-variance-authority';
import type { Progress as ProgressPrimitive } from 'radix-ui';
import type * as React from 'react';
import { type progressVariants } from '.';

export type ProgressProps = React.ComponentProps<
    typeof ProgressPrimitive.Root
> &
    VariantProps<typeof progressVariants>;
