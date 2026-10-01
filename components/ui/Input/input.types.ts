import type { ComponentProps, ReactNode } from 'react';

export type InputProps = ComponentProps<'input'>;

export type InputWrapperProps = InputProps & {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    startAddon?: ReactNode;
    endAddon?: ReactNode;
    action?: ReactNode;
};
