'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import type { ComponentProps } from 'react';

const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex field-sizing-content min-h-18 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow,border] outline-none placeholder:text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                'border-input/50 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/50 hover:enabled:border-primary',
                'aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/50',
                className,
            )}
            {...props}
        />
    );
};

export { Textarea };
