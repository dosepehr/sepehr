import type { VariantProps } from 'class-variance-authority';
import { type Switch as SwitchPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import type { switchVariants, switchWrapperVariants } from './components';

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root> &
    VariantProps<typeof switchVariants> & {
        label?: string;
        size?: 'sm' | 'default';
    };

export type SwitchWrapperProps = VariantProps<typeof switchWrapperVariants> &
    Pick<
        ComponentProps<typeof SwitchPrimitive.Root>,
        | 'id'
        | 'checked'
        | 'defaultChecked'
        | 'onCheckedChange'
        | 'disabled'
        | 'required'
        | 'name'
    > & {
        label?: string;
        description?: string;
        className?: string;
        size?: 'sm' | 'default';
    };
