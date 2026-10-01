import { type Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import type { TooltipContentVariantProps } from './components';

export type TooltipWrapperProps = TooltipContentVariantProps & {
    content: ReactNode;
    children: ReactNode;
    side?: ComponentProps<typeof TooltipPrimitive.Content>['side'];
    sideOffset?: number;
    delayDuration?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    contentClassName?: string;
};
