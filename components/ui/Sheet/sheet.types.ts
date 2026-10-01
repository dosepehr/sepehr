import type * as React from 'react';

export interface SheetWrapperProps {
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showCloseButton?: boolean;
    contentClassName?: string;
}
