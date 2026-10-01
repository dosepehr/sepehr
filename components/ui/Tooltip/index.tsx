'use client';

import type { FC } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './components';
import type { TooltipWrapperProps } from './tooltip.types';

const TooltipWrapper: FC<TooltipWrapperProps> = ({
    content,
    children,
    side = 'top',
    sideOffset = 4,
    delayDuration = 0,
    open,
    defaultOpen,
    onOpenChange,
    contentClassName,
    variant,
}) => {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <Tooltip
                open={open}
                defaultOpen={defaultOpen}
                onOpenChange={onOpenChange}
            >
                <TooltipTrigger>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    sideOffset={sideOffset}
                    variant={variant}
                    className={contentClassName}
                >
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default TooltipWrapper;
