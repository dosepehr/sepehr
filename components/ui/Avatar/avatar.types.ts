import type { Avatar as AvatarPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

export type AvatarWrapperProps = {
    src?: string;
    alt?: string;
    fallback: ReactNode;
    badge?: ReactNode;
    badgeClassName?: string;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
    imageProps?: Omit<
        ComponentProps<typeof AvatarPrimitive.Image>,
        'src' | 'alt'
    >;
    fallbackProps?: Omit<
        ComponentProps<typeof AvatarPrimitive.Fallback>,
        'children'
    >;
};
