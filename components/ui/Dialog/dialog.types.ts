import type * as React from 'react';

export type DialogMaxWidth =
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';

export interface DialogWrapperProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    cancelLabel?: string;
    showCancelButton?: boolean;
    showCloseIcon?: boolean;
    maxWidth?: DialogMaxWidth;
    contentClassName?: string;
}
