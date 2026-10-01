'use client';

import AvatarWrapper from '@/components/ui/Avatar';
import BubbleWrapper from '@/components/ui/Bubble';
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageHeader,
} from './components';
import type { MessageWrapperProps } from './message.types';

const MessageWrapper = ({
    align = 'start',
    avatar,
    avatarSrc,
    avatarAlt,
    avatarFallback,
    avatarBadge,
    reserveAvatarSpace = false,
    header,
    footer,
    children,
    variant = 'default',
    contentAsChild = false,
    render,
    className,
    contentClassName,
    avatarClassName,
    headerClassName,
    footerClassName,
    ...props
}: MessageWrapperProps) => {
    const avatarContent =
        avatar ??
        (avatarFallback !== undefined ? (
            <AvatarWrapper
                src={avatarSrc}
                alt={avatarAlt}
                fallback={avatarFallback}
                badge={avatarBadge}
                size="sm"
            />
        ) : undefined);

    return (
        <Message align={align} className={className} {...props}>
            {(avatarContent || reserveAvatarSpace) && (
                <MessageAvatar className={avatarClassName}>
                    {avatarContent}
                </MessageAvatar>
            )}
            <MessageContent className={contentClassName}>
                {header && (
                    <MessageHeader className={headerClassName}>
                        {header}
                    </MessageHeader>
                )}
                {render
                    ? render
                    : children && (
                          <BubbleWrapper
                              variant={variant}
                              align={align}
                              contentAsChild={contentAsChild}
                          >
                              {children}
                          </BubbleWrapper>
                      )}
                {footer && (
                    <MessageFooter className={footerClassName}>
                        {footer}
                    </MessageFooter>
                )}
            </MessageContent>
        </Message>
    );
};

export default MessageWrapper;
