'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Toggle as TogglePrimitive } from 'radix-ui';
import * as React from 'react';

export const toggleVariants = cva(
    "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'border border-transparent bg-transparent text-foreground hover:bg-muted data-[state=on]:bg-muted data-[state=on]:border-border',
                outline:
                    'border border-input bg-transparent text-foreground hover:bg-muted data-[state=on]:bg-muted',
                primary:
                    'border border-primary/30 bg-transparent text-primary-text hover:bg-primary/10 data-[state=on]:bg-primary/15 data-[state=on]:border-primary',
                success:
                    'border border-success/30 bg-transparent text-success-text hover:bg-success/10 data-[state=on]:bg-success/15 data-[state=on]:border-success',
                warning:
                    'border border-warning/30 bg-transparent text-warning-text hover:bg-warning/10 data-[state=on]:bg-warning/15 data-[state=on]:border-warning',
                destructive:
                    'border border-destructive/30 bg-transparent text-destructive-text hover:bg-destructive/10 data-[state=on]:bg-destructive/15 data-[state=on]:border-destructive',
                info: 'border border-info/30 bg-transparent text-info-text hover:bg-info/10 data-[state=on]:bg-info/15 data-[state=on]:border-info',
            },
            size: {
                sm: 'h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*="size-"])]:size-3.5',
                default:
                    'h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
                lg: 'h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const Toggle = ({
    className,
    variant = 'default',
    size = 'default',
    ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>) => {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size }), className)}
            {...props}
        />
    );
};

export default Toggle;
