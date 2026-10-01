import type { ComponentProps } from 'react';

export type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
    label?: string;
    error?: string;
    required?: boolean;
};
