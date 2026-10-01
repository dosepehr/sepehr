'use client';
/* c8 ignore stop */

import { Button } from '@/components/ui/Button/components';
import { cn } from '@/lib/funcs/cn';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

const Dialog = ({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
};

const DialogTrigger = ({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) => {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
};

const DialogClose = ({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) => {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
};

const DialogPortal = ({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) => {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
};

const DialogOverlay = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
                className,
            )}
            {...props}
        />
    );
};

const DialogContent = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) => {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={cn(
                    'fixed start-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none rtl:translate-x-1/2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                    className,
                )}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
};

const DialogHeader = ({
    className,
    showCloseButton = true,
    children,
    ...props
}: React.ComponentProps<'div'> & { showCloseButton?: boolean }) => {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                'sticky top-0 z-10 flex items-start justify-between gap-2 rounded-t-xl border-b bg-popover px-6 py-4',
                className,
            )}
            {...props}
        >
            <div className="flex flex-col gap-1">{children}</div>
            {showCloseButton && (
                <DialogPrimitive.Close data-slot="dialog-close" asChild><Button variant="ghost" size="icon-sm" className="shrink-0"><XIcon /><span className="sr-only">Close</span></Button></DialogPrimitive.Close>
            )}
        </div>
    );
};

const DialogBody = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dialog-body"
            className={cn('flex flex-col gap-4 px-6 py-4', className)}
            {...props}
        />
    );
};

const DialogFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                'sticky bottom-0 z-10 flex flex-row-reverse gap-2 rounded-b-xl border-t bg-muted px-6 py-4',
                className,
            )}
            {...props}
        />
    );
};

const DialogTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn('text-base font-medium text-foreground', className)}
            {...props}
        />
    );
};

const DialogDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
};

export {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
};
