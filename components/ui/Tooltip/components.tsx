'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import * as React from 'react';

export const tooltipVariants = cva(
    'z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pe-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
    {
        variants: {
            variant: {
                default: 'bg-foreground text-background',
                primary: 'bg-primary text-primary-foreground',
                success: 'bg-success text-success-foreground',
                warning: 'bg-warning text-warning-foreground',
                destructive: 'bg-destructive text-white',
                info: 'bg-info text-info-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

// arrow needs matching bg-* + fill-* — Radix wraps the SVG in a div (bg-*) and the SVG path itself (fill-*)
const arrowClassMap: Record<string, string> = {
    default: 'bg-foreground fill-foreground',
    primary: 'bg-primary fill-primary',
    success: 'bg-success fill-success',
    warning: 'bg-warning fill-warning',
    destructive: 'bg-destructive fill-destructive',
    info: 'bg-info fill-info',
};

export type TooltipContentVariantProps = VariantProps<typeof tooltipVariants>;

const TooltipProvider = ({
    delayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
};

const Tooltip = ({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
};

const TooltipTrigger = ({
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

const TooltipContent = ({
    className,
    sideOffset = 0,
    variant = 'default',
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
    TooltipContentVariantProps) => {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(tooltipVariants({ variant }), className)}
                {...props}
            >
                {children}
                <TooltipPrimitive.Arrow
                    className={cn(
                        'z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs',
                        /* c8 ignore next */
                        arrowClassMap[variant ?? 'default'],
                    )}
                />
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
