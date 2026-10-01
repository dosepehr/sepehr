'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import * as React from 'react';
import { ScrollBar } from './components';

const ScrollArea = ({
    className,
    children,
    onViewportScroll,
    ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
    onViewportScroll?: React.UIEventHandler<HTMLDivElement>;
}) => {
    return (
        <ScrollAreaPrimitive.Root
            data-slot="scroll-area"
            className={cn('relative', className)}
            {...props}
        >
            <ScrollAreaPrimitive.Viewport
                data-slot="scroll-area-viewport"
                className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
                onScroll={onViewportScroll}
            >
                {children}
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar />
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    );
};

export * from './components';

export default ScrollArea;
