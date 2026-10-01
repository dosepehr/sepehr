import type { ReactNode } from 'react';

export type ComboBoxOption = {
    value: string;
    label: ReactNode;
    [key: string]: unknown;
};

export type ComboBoxProps = {
    options: ComboBoxOption[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundText?: string;
    required?: boolean;
    disabled?: boolean;
    isPending?: boolean;
    isError?: boolean;
    error?: string;
    className?: string;
};
