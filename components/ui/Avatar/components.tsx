'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

const Avatar = ({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
    size?: 'sm' | 'default' | 'lg';
}) => {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            data-size={size}
            className={cn(
                'relative inline-flex shrink-0 rounded-full',
                size === 'sm' && 'size-7',
                size === 'default' && 'size-9',
                size === 'lg' && 'size-12',
                className,
            )}
            {...props}
        />
    );
};

const AvatarImage = ({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn(
                'aspect-square size-full overflow-hidden rounded-full object-cover',
                className,
            )}
            {...props}
        />
    );
};

const AvatarFallback = ({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                'flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
};

const AvatarBadge = ({ className, ...props }: React.ComponentProps<'span'>) => {
    return (
        <span
            data-slot="avatar-badge"
            className={cn(
                'absolute right-0 bottom-0 flex size-3 items-center justify-center rounded-full bg-muted ring-2 ring-background [&_svg:not([class*="size-"])]:size-2',
                className,
            )}
            {...props}
        />
    );
};

const AvatarGroup = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="avatar-group"
            className={cn('flex -space-x-2', className)}
            {...props}
        />
    );
};

const AvatarGroupCount = ({
    className,
    ...props
}: React.ComponentProps<'span'>) => {
    return (
        <span
            data-slot="avatar-group-count"
            className={cn(
                'relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background [&_svg:not([class*="size-"])]:size-4',
                className,
            )}
            {...props}
        />
    );
};

export {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
};
