import type { VariantProps } from 'class-variance-authority';
import { type RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import type {
    radioGroupItemVariants,
    radioGroupWrapperVariants,
} from './components';

export type RadioGroupItemProps = ComponentProps<
    typeof RadioGroupPrimitive.Item
> &
    VariantProps<typeof radioGroupItemVariants> & {
        label?: string;
    };

export type RadioGroupOptionDef = {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
};

export type RadioGroupWrapperProps = VariantProps<
    typeof radioGroupWrapperVariants
> &
    Pick<
        ComponentProps<typeof RadioGroupPrimitive.Root>,
        | 'value'
        | 'defaultValue'
        | 'onValueChange'
        | 'disabled'
        | 'required'
        | 'name'
        | 'orientation'
    > & {
        options: RadioGroupOptionDef[];
        className?: string;
    };
