import type { VariantProps } from 'class-variance-authority';
import { type ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import type { toggleVariants } from '@/components/ui/Toggle';
import type { ToggleGroupItem } from './components';

export type ToggleGroupItemDef = ComponentProps<typeof ToggleGroupItem> & {
    label?: ReactNode;
};

export type ToggleGroupWrapperProps = ComponentProps<
    typeof ToggleGroupPrimitive.Root
> &
    VariantProps<typeof toggleVariants> & {
        items: ToggleGroupItemDef[];
        spacing?: number;
        orientation?: 'horizontal' | 'vertical';
    };
