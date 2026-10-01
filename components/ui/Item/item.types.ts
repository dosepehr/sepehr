import type { ComponentProps, ReactNode } from 'react';

export type ItemVariant = 'ghost' | 'outline' | 'filled';
export type ItemSize = 'xs' | 'sm' | 'default';
export type ItemMediaVariant = 'icon' | 'avatar' | 'image';

export type ItemProps = ComponentProps<'div'> & {
    variant?: ItemVariant;
    size?: ItemSize;
    active?: boolean;
    disabled?: boolean;
    asChild?: boolean;
};

export type ItemMediaProps = ComponentProps<'div'> & {
    variant?: ItemMediaVariant;
};

export type ItemContentProps = ComponentProps<'div'>;
export type ItemTitleProps = ComponentProps<'div'>;
export type ItemDescriptionProps = ComponentProps<'div'>;
export type ItemEndProps = ComponentProps<'div'>;

export type ItemWrapperProps = ItemProps & {
    title?: ReactNode;
    description?: ReactNode;
    media?: ReactNode;
    mediaVariant?: ItemMediaVariant;
    end?: ReactNode;
};
