import type { ComponentProps } from 'react';

export type TextareaProps = ComponentProps<'textarea'>;

export type TextareaWrapperProps = TextareaProps & {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
};
