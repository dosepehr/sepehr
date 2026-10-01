import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { Drawer as DrawerPrimitive } from 'vaul';

export type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

export type DrawerProps = ComponentProps<typeof DrawerPrimitive.Root>;

export type DrawerOverlayProps = ComponentProps<typeof DrawerPrimitive.Overlay>;

export type DrawerHandleProps = ComponentProps<typeof DrawerPrimitive.Handle>;

export type DrawerContentProps = ComponentProps<
    typeof DrawerPrimitive.Content
> & {
    /** Renders a drag handle at the top of the drawer. Only visible on vertical (top/bottom) drawers. */
    showHandle?: boolean;
};

export type DrawerHeaderProps = ComponentProps<'div'>;
export type DrawerFooterProps = ComponentProps<'div'>;

export type DrawerTitleProps = ComponentProps<typeof DrawerPrimitive.Title>;
export type DrawerDescriptionProps = ComponentProps<
    typeof DrawerPrimitive.Description
>;

export type DrawerWrapperProps = Omit<
    DrawerProps,
    'children' | 'fadeFromIndex'
> & {
    /** Trigger element. Rendered via DrawerTrigger's `asChild` behavior. */
    trigger?: ReactElement<Record<string, unknown>>;
    /** Trigger label/content when `trigger` is provided. */
    triggerChildren?: ReactNode;
    /** Drawer title, rendered inside DrawerHeader. */
    title?: ReactNode;
    /** Drawer description, rendered inside DrawerHeader below the title. */
    description?: ReactNode;
    /** Hides the built-in DrawerHeader (title/description) entirely. */
    hideHeader?: boolean;
    /** Body content, rendered between the header and footer. */
    children?: ReactNode;
    /** Footer content, such as submit/cancel actions. */
    footer?: ReactNode;
    /** Renders a drag handle at the top of the drawer. Only visible on vertical (top/bottom) drawers. */
    showHandle?: boolean;
    /** Additional classes for DrawerContent (the popup surface). */
    contentClassName?: string;
    /** Additional classes for the header slot. */
    headerClassName?: string;
    /** Additional classes for the body slot. */
    bodyClassName?: string;
    /** Additional classes for the footer slot. */
    footerClassName?: string;
    /** Additional classes for the title. */
    titleClassName?: string;
    /** Additional classes for the description. */
    descriptionClassName?: string;
};
