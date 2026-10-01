import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import type { emptyMediaVariants } from './components';

export type EmptyWrapperProps = {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    mediaVariant?: VariantProps<typeof emptyMediaVariants>['variant'];
    action?: React.ReactNode;
    className?: string;
};
