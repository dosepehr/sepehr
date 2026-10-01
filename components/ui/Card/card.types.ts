import type { ComponentProps, ReactNode } from 'react';

export type CardWrapperProps = {
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    size?: 'default' | 'sm';
    className?: string;
    headerProps?: ComponentProps<'div'>;
    contentProps?: ComponentProps<'div'>;
    footerProps?: ComponentProps<'div'>;
};
