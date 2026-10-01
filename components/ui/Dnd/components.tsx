'use client';

import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const dndVariants = cva(
    'group/dnd relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-6 text-center transition-colors not-data-[disabled=true]:hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5 data-[invalid=true]:border-destructive/40',
    {
        variants: {
            size: {
                default: 'min-h-60',
                sm: 'min-h-40',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

const DndZone = ({
    className,
    size,
    dragging,
    disabled,
    invalid,
    ...props
}: React.ComponentProps<'div'> &
    VariantProps<typeof dndVariants> & {
        dragging?: boolean;
        disabled?: boolean;
        invalid?: boolean;
    }) => {
    return (
        <div
            data-slot="dnd-zone"
            data-dragging={dragging || undefined}
            data-disabled={disabled || undefined}
            data-invalid={invalid || undefined}
            className={cn(dndVariants({ size }), className)}
            {...props}
        />
    );
};

const DndInput = ({ className, ...props }: React.ComponentProps<'input'>) => {
    // The surrounding DndZone (role="button") is the sole interactive
    // target and already handles click/keyboard — this input is only
    // triggered programmatically via ref, so it's excluded from the a11y
    // tree and tab order to avoid a redundant, unlabeled nested control.
    return (
        <input
            data-slot="dnd-input"
            type="file"
            tabIndex={-1}
            aria-hidden="true"
            className={cn('sr-only', className)}
            {...props}
        />
    );
};

const DndList = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dnd-list"
            className={cn(
                'flex w-full flex-col gap-2 *:data-[slot=attachment]:w-full *:data-[slot=attachment]:max-w-full',
                className,
            )}
            {...props}
        />
    );
};

const DndFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dnd-footer"
            className={cn(
                'mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
};

const DndPreview = ({
    className,
    invalid,
    ...props
}: React.ComponentProps<'div'> & { invalid?: boolean }) => {
    return (
        <div
            data-slot="dnd-preview"
            data-invalid={invalid || undefined}
            className={cn(
                'relative flex size-full flex-col overflow-hidden rounded-xl border bg-card data-[invalid=true]:border-destructive/40',
                className,
            )}
            {...props}
        />
    );
};

const DndPreviewMedia = ({
    className,
    ...props
}: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dnd-preview-media"
            className={cn(
                'flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted [&_img]:size-full [&_img]:object-contain [&_svg]:size-10 [&_svg]:text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
};

const DndPreviewFooter = ({
    className,
    ...props
}: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="dnd-preview-footer"
            className={cn(
                'flex items-center justify-between gap-2 border-t bg-card px-3 py-2',
                className,
            )}
            {...props}
        />
    );
};

export {
    DndFooter,
    DndInput,
    DndList,
    DndPreview,
    DndPreviewFooter,
    DndPreviewMedia,
    dndVariants,
    DndZone,
};
