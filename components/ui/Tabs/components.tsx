'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

const tabsListVariants = cva('inline-flex items-center', {
    variants: {
        variant: {
            line: 'gap-1 border-b border-border w-full',
            pill: 'gap-1 rounded-lg bg-muted p-1',
            button: 'gap-1',
        },
    },
    defaultVariants: { variant: 'line' },
});

const tabsTriggerVariants = cva(
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                line: [
                    'relative h-9 px-3 text-muted-foreground rounded-t-md select-none',
                    'hover:text-foreground',
                    'focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:text-foreground',
                    'data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary',
                ],
                pill: [
                    'h-7 px-3 rounded-md text-muted-foreground select-none',
                    'hover:text-foreground',
                    'focus-visible:ring-3 focus-visible:ring-primary/50',
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
                ],
                button: [
                    'h-8 px-3 rounded-lg border border-transparent text-muted-foreground select-none',
                    'hover:text-foreground hover:bg-muted',
                    'focus-visible:ring-3 focus-visible:ring-primary/50',
                    'data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
                ],
            },
        },
        defaultVariants: { variant: 'line' },
    },
);

const TabsList = ({
    className,
    variant,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>) => {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            data-variant={variant}
            className={cn(tabsListVariants({ variant }), className)}
            {...props}
        />
    );
};

const TabsTrigger = ({
    className,
    variant,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>) => {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(tabsTriggerVariants({ variant }), className)}
            {...props}
        />
    );
};

const TabsContent = ({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn('mt-4 outline-none', className)}
            {...props}
        />
    );
};

export {
    TabsContent,
    TabsList,
    tabsListVariants,
    TabsTrigger,
    tabsTriggerVariants,
};
