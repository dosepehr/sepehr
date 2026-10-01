'use client';

import type { FC } from 'react';
import type { AvatarWrapperProps } from './avatar.types';
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from './components';

const AvatarWrapper: FC<AvatarWrapperProps> = ({
    src,
    alt,
    fallback,
    badge,
    badgeClassName,
    size = 'default',
    className,
    imageProps,
    fallbackProps,
}) => {
    return (
        <Avatar size={size} className={className}>
            {src && <AvatarImage src={src} alt={alt} {...imageProps} />}
            <AvatarFallback {...fallbackProps}>{fallback}</AvatarFallback>
            {badge && (
                <AvatarBadge className={badgeClassName}>{badge}</AvatarBadge>
            )}
        </Avatar>
    );
};

export default AvatarWrapper;

export type { AvatarWrapperProps } from './avatar.types';
export {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from './components';
