'use client';

import { cn } from '@/lib/funcs/cn';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button/components';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './components';
import type { DialogMaxWidth, DialogWrapperProps } from './dialog.types';

const maxWidthMap: Record<DialogMaxWidth, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
};

const DialogWrapper: FC<DialogWrapperProps> = ({
    trigger,
    open,
    onOpenChange,
    title,
    description,
    icon,
    children,
    footer,
    cancelLabel = 'Cancel',
    showCancelButton = true,
    showCloseIcon = true,
    maxWidth = 'lg',
    contentClassName,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(maxWidthMap[maxWidth], contentClassName)}
                {...(!description && { 'aria-describedby': undefined })}
            >
                {(title || description || icon) && (
                    <DialogHeader showCloseButton={showCloseIcon}>
                        {title && (
                            <DialogTitle className="flex items-center gap-2">
                                {icon && (
                                    <span className="text-muted-foreground">
                                        {icon}
                                    </span>
                                )}
                                {title}
                            </DialogTitle>
                        )}
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                )}
                {children && <DialogBody>{children}</DialogBody>}
                {(footer || showCancelButton) && (
                    <DialogFooter>
                        {footer}
                        {showCancelButton && (
                            <DialogClose asChild><Button variant="outline">{cancelLabel}</Button></DialogClose>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DialogWrapper;
