'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import type {
    DrawerContentProps,
    DrawerDescriptionProps,
    DrawerFooterProps,
    DrawerHandleProps,
    DrawerHeaderProps,
    DrawerOverlayProps,
    DrawerProps,
    DrawerTitleProps,
} from './drawer.types';

const Drawer = ({ direction = 'bottom', ...props }: DrawerProps) => {
    return (
        <DrawerPrimitive.Root
            data-slot="drawer"
            direction={direction}
            {...props}
        />
    );
};

const DrawerTrigger = (
    props: React.ComponentProps<typeof DrawerPrimitive.Trigger>,
) => {
    return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
};

const DrawerPortal = (
    props: React.ComponentProps<typeof DrawerPrimitive.Portal>,
) => {
    return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
};

const DrawerClose = (
    props: React.ComponentProps<typeof DrawerPrimitive.Close>,
) => {
    return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
};

const DrawerOverlay = ({ className, ...props }: DrawerOverlayProps) => {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
                className,
            )}
            {...props}
        />
    );
};

const DrawerHandle = ({ className, ...props }: DrawerHandleProps) => {
    return (
        <DrawerPrimitive.Handle
            data-slot="drawer-handle"
            className={cn(
                'mx-auto mt-4 hidden h-1 w-25 shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block group-data-[vaul-drawer-direction=top]/drawer-content:block',
                className,
            )}
            {...props}
        />
    );
};

const DrawerContent = ({
    className,
    children,
    showHandle = false,
    ...props
}: DrawerContentProps) => {
    return (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    'group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground outline-none data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:inset-s-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-e-xl data-[vaul-drawer-direction=left]:border-e data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:inset-e-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-s-xl data-[vaul-drawer-direction=right]:border-s data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-snap-points=true]:data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-snap-points=true]:data-[vaul-drawer-direction=bottom]:h-full data-[vaul-snap-points=true]:data-[vaul-drawer-direction=bottom]:max-h-full data-[vaul-snap-points=true]:data-[vaul-drawer-direction=top]:mb-0 data-[vaul-snap-points=true]:data-[vaul-drawer-direction=top]:h-full data-[vaul-snap-points=true]:data-[vaul-drawer-direction=top]:max-h-full data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm',
                    className,
                )}
                {...props}
            >
                {showHandle && <DrawerHandle />}
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    );
};

const DrawerHeader = ({ className, ...props }: DrawerHeaderProps) => {
    return (
        <div
            data-slot="drawer-header"
            className={cn(
                'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:text-start',
                className,
            )}
            {...props}
        />
    );
};

const DrawerFooter = ({ className, ...props }: DrawerFooterProps) => {
    return (
        <div
            data-slot="drawer-footer"
            className={cn('mt-auto flex flex-col gap-2 p-4', className)}
            {...props}
        />
    );
};

const DrawerTitle = ({ className, ...props }: DrawerTitleProps) => {
    return (
        <DrawerPrimitive.Title
            data-slot="drawer-title"
            className={cn('text-base font-medium text-foreground', className)}
            {...props}
        />
    );
};

const DrawerDescription = ({ className, ...props }: DrawerDescriptionProps) => {
    return (
        <DrawerPrimitive.Description
            data-slot="drawer-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
};

export {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHandle,
    DrawerHeader,
    DrawerOverlay,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger,
};
