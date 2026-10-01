'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import * as React from 'react';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
};

export * from './components';

export default Pagination;
