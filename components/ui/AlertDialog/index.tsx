'use client';

import { cva } from 'class-variance-authority';
import type { FC } from 'react';
import type { AlertDialogWrapperProps } from './alert-dialog.types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './components';

const mediaVariants = cva('', {
    variants: {
        intent: {
            default: 'bg-muted text-foreground',
            destructive:
                'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
            warning: 'bg-warning/10 text-warning-foreground dark:bg-warning/20',
            info: 'bg-info/10 text-info-foreground dark:bg-info/20',
            success: 'bg-success/10 text-success-foreground dark:bg-success/20',
        },
    },
    defaultVariants: { intent: 'default' },
});

const AlertDialogWrapper: FC<AlertDialogWrapperProps> = ({
    trigger,
    title,
    description,
    media,
    mediaClassName,
    intent = 'default',
    confirmLabel = 'Continue',
    cancelLabel = 'Cancel',
    size = 'default',
    actionProps,
    cancelProps,
    contentProps,
    open,
    onOpenChange,
}) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            )}
            <AlertDialogContent size={size} {...contentProps}>
                <AlertDialogHeader>
                    {media && (
                        <AlertDialogMedia
                            className={mediaVariants({
                                intent,
                                className: mediaClassName,
                            })}
                        >
                            {media}
                        </AlertDialogMedia>
                    )}
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel {...cancelProps}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction variant={intent} {...actionProps}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AlertDialogWrapper;
