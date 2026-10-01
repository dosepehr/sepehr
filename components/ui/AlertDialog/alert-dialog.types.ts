import type { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import type { Button } from '@/components/ui/Button/components';

type ActionProps = ComponentProps<typeof AlertDialogPrimitive.Action> &
    Pick<ComponentProps<typeof Button>, 'variant' | 'size'>;

type CancelProps = ComponentProps<typeof AlertDialogPrimitive.Cancel> &
    Pick<ComponentProps<typeof Button>, 'variant' | 'size'>;

export type AlertDialogIntent =
    | 'default'
    | 'destructive'
    | 'warning'
    | 'info'
    | 'success';

export type AlertDialogWrapperProps = {
    trigger?: ReactNode;
    title: ReactNode;
    description: ReactNode;
    media?: ReactNode;
    mediaClassName?: string;
    intent?: AlertDialogIntent;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    size?: 'default' | 'sm';
    actionProps?: Omit<ActionProps, 'children'>;
    cancelProps?: Omit<CancelProps, 'children'>;
    contentProps?: ComponentProps<typeof AlertDialogPrimitive.Content>;
    /** Controls the dialog externally instead of via `trigger`. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
