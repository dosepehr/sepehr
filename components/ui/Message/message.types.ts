import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { BubbleWrapperProps } from '@/components/ui/Bubble/bubble.types';

export type MessageAlign = 'start' | 'end';

export type MessageProps = ComponentProps<'div'> & {
    align?: MessageAlign;
};

export type MessageGroupProps = ComponentProps<'div'>;
export type MessageAvatarProps = ComponentProps<'div'>;
export type MessageContentProps = ComponentProps<'div'>;
export type MessageHeaderProps = ComponentProps<'div'>;
export type MessageFooterProps = ComponentProps<'div'>;

export type MessageWrapperProps = Omit<ComponentProps<'div'>, 'children'> & {
    /** Alignment of the message row and bubble within the conversation. */
    align?: MessageAlign;
    /** Avatar rendered next to the message. Takes precedence over avatarSrc/avatarFallback/avatarBadge. */
    avatar?: ReactNode;
    /** Image source for the built-in AvatarWrapper. Ignored when `avatar` is provided. */
    avatarSrc?: string;
    /** Alt text for the built-in AvatarWrapper's image. */
    avatarAlt?: string;
    /** Fallback content (e.g. initials) for the built-in AvatarWrapper. Building the avatar via AvatarWrapper requires this. */
    avatarFallback?: ReactNode;
    /** Badge rendered on the built-in AvatarWrapper, e.g. an online status dot. */
    avatarBadge?: ReactNode;
    /** Renders an empty, invisible avatar slot to keep grouped messages aligned. */
    reserveAvatarSpace?: boolean;
    /** Content rendered above the message surface, such as a sender name. */
    header?: ReactNode;
    /** Content rendered below the message surface, such as status or actions. */
    footer?: ReactNode;
    /** Message bubble content. Rendered inside a Bubble unless `render` is provided. */
    children?: ReactNode;
    /** Visual treatment of the bubble. */
    variant?: BubbleWrapperProps['variant'];
    /** Render the bubble content as its child element (for link/button bubbles). */
    contentAsChild?: boolean;
    /** Renders custom content instead of the default Bubble, e.g. an Attachment. */
    render?: ReactElement<Record<string, unknown>>;
    /** Additional classes for the content slot (header + bubble + footer column). */
    contentClassName?: string;
    /** Additional classes for the avatar slot. */
    avatarClassName?: string;
    /** Additional classes for the header slot. */
    headerClassName?: string;
    /** Additional classes for the footer slot. */
    footerClassName?: string;
};
