import type { ReactNode } from 'react';

export type BreadcrumbItemDef = {
    label: ReactNode;
    href?: string;
    /** Accessible name for icon-only labels. */
    'aria-label'?: string;
};

export type BreadcrumbWrapperProps = {
    items: BreadcrumbItemDef[];
    separator?: ReactNode;
    ellipsis?: boolean;
    maxItems?: number;
};
