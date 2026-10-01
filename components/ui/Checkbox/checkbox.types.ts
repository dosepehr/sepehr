import type { VariantProps } from 'class-variance-authority';
import { type Checkbox as CheckboxPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import type { checkboxVariants, checkboxWrapperVariants } from './components';

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants> & {
        label?: string;
    };

export type CheckboxWrapperProps = VariantProps<
    typeof checkboxWrapperVariants
> &
    Pick<
        ComponentProps<typeof CheckboxPrimitive.Root>,
        | 'id'
        | 'checked'
        | 'defaultChecked'
        | 'onCheckedChange'
        | 'disabled'
        | 'required'
        | 'name'
        | 'value'
    > & {
        label?: string;
        description?: string;
        className?: string;
        title?: string;
    };
