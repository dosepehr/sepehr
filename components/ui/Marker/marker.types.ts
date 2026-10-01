import type { ComponentProps, ReactElement, ReactNode } from 'react';

export type MarkerVariant = 'default' | 'border' | 'separator';

export type MarkerProps = ComponentProps<'div'> & {
    variant?: MarkerVariant;
    asChild?: boolean;
};

export type MarkerIconProps = ComponentProps<'span'>;
export type MarkerContentProps = ComponentProps<'span'>;

export type MarkerWrapperProps = Omit<ComponentProps<'div'>, 'children'> & {
    variant?: MarkerVariant;
    /** Decorative icon shown before the content. Hidden from assistive tech. */
    icon?: ReactNode;
    children?: ReactNode;
    /** Additional classes for the icon slot. */
    iconClassName?: string;
    /** Additional classes for the content slot. */
    contentClassName?: string;
    /** Applies the shimmer text animation to the content, for streaming status markers. */
    shimmer?: boolean;
    /** Renders the marker as a link/button element instead of a div, e.g. `<a href="#" />`. */
    render?: ReactElement<Record<string, unknown>>;
};
