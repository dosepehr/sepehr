'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import type {
    MessageAvatarProps,
    MessageContentProps,
    MessageFooterProps,
    MessageGroupProps,
    MessageHeaderProps,
    MessageProps,
} from './message.types';

const MessageGroup = ({ className, ...props }: MessageGroupProps) => {
    return (
        <div
            data-slot="message-group"
            className={cn('flex min-w-0 flex-col gap-2', className)}
            {...props}
        />
    );
};

const Message = ({ align = 'start', className, ...props }: MessageProps) => {
    return (
        <div
            data-slot="message"
            data-align={align}
            className={cn(
                'group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse',
                className,
            )}
            {...props}
        />
    );
};

const MessageAvatar = ({ className, ...props }: MessageAvatarProps) => {
    return (
        <div
            data-slot="message-avatar"
            className={cn(
                'flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8',
                className,
            )}
            {...props}
        />
    );
};

const MessageContent = ({ className, ...props }: MessageContentProps) => {
    return (
        <div
            data-slot="message-content"
            className={cn(
                'flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end',
                className,
            )}
            {...props}
        />
    );
};

const MessageHeader = ({ className, ...props }: MessageHeaderProps) => {
    return (
        <div
            data-slot="message-header"
            className={cn(
                'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0',
                className,
            )}
            {...props}
        />
    );
};

const MessageFooter = ({ className, ...props }: MessageFooterProps) => {
    return (
        <div
            data-slot="message-footer"
            className={cn(
                'flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end',
                className,
            )}
            {...props}
        />
    );
};

export {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
    MessageHeader,
};
