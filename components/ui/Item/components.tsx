'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type {
    ItemContentProps,
    ItemDescriptionProps,
    ItemEndProps,
    ItemMediaProps,
    ItemProps,
    ItemTitleProps,
} from './item.types';

const itemVariants = cva(
    'group/item flex w-full items-center gap-3 rounded-lg text-sm text-foreground transition-colors outline-none',
    {
        variants: {
            variant: {
                ghost: '',
                outline: 'border border-border bg-background shadow-xs',
                filled: 'bg-muted/60',
            },
            size: {
                xs: 'px-2 py-1.5',
                sm: 'px-2.5 py-2',
                default: 'px-3 py-2.5',
            },
        },
        defaultVariants: {
            variant: 'ghost',
            size: 'default',
        },
    },
);

const mediaVariants = cva(
    'shrink-0 flex items-center justify-center text-muted-foreground [&_svg]:size-4',
    {
        variants: {
            variant: {
                icon: 'size-8 rounded-md bg-muted group-data-[size=xs]/item:size-6 group-data-[size=sm]/item:size-7 [&_svg]:size-4 group-data-[size=xs]/item:[&_svg]:size-3.5',
                avatar: 'size-8 rounded-full overflow-hidden group-data-[size=xs]/item:size-6 group-data-[size=sm]/item:size-7',
                image: 'size-10 rounded-md overflow-hidden group-data-[size=xs]/item:size-7 group-data-[size=sm]/item:size-8',
            },
        },
        defaultVariants: {
            variant: 'icon',
        },
    },
);

const Item = ({
    variant = 'ghost',
    size = 'default',
    active = false,
    disabled = false,
    asChild = false,
    className,
    onClick,
    ...props
}: ItemProps) => {
    const isInteractive = !!onClick || asChild;
    const Comp = asChild ? Slot.Root : 'div';

    return (
        <Comp
            data-slot="item"
            data-size={size}
            data-active={active || undefined}
            data-disabled={disabled || undefined}
            aria-disabled={disabled || undefined}
            onClick={disabled ? undefined : onClick}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive && !disabled ? 0 : undefined}
            className={cn(
                itemVariants({ variant, size }),
                isInteractive &&
                    !disabled &&
                    'cursor-pointer select-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-primary/50',
                variant === 'outline' &&
                    isInteractive &&
                    !disabled &&
                    'hover:bg-muted/50',
                active && 'bg-primary/10 text-primary-text',
                disabled && 'cursor-not-allowed opacity-50',
                className,
            )}
            {...props}
        />
    );
};

const ItemMedia = ({
    variant = 'icon',
    className,
    ...props
}: ItemMediaProps) => {
    return (
        <div
            data-slot="item-media"
            data-variant={variant}
            className={cn(mediaVariants({ variant }), className)}
            {...props}
        />
    );
};

const ItemContent = ({ className, ...props }: ItemContentProps) => {
    return (
        <div
            data-slot="item-content"
            className={cn('flex min-w-0 flex-1 flex-col', className)}
            {...props}
        />
    );
};

const ItemTitle = ({ className, ...props }: ItemTitleProps) => {
    return (
        <div
            data-slot="item-title"
            className={cn(
                'truncate leading-snug font-medium group-data-[size=xs]/item:text-xs',
                className,
            )}
            {...props}
        />
    );
};

const ItemDescription = ({ className, ...props }: ItemDescriptionProps) => {
    return (
        <div
            data-slot="item-description"
            className={cn(
                'truncate text-xs leading-snug text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
};

const ItemEnd = ({ className, ...props }: ItemEndProps) => {
    return (
        <div
            data-slot="item-end"
            className={cn(
                'ms-auto shrink-0 text-muted-foreground [&_svg]:size-4',
                className,
            )}
            {...props}
        />
    );
};

export { Item, ItemContent, ItemDescription, ItemEnd, ItemMedia, ItemTitle };
