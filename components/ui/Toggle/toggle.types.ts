import type { VariantProps } from 'class-variance-authority';
import { type Toggle as TogglePrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import type { toggleVariants } from '.';

export type ToggleProps = ComponentProps<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>;
