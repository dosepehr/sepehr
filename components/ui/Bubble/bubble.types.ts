import type { ReactNode } from 'react';

export type BubbleVariant =
    | 'default'
    | 'secondary'
    | 'muted'
    | 'tinted'
    | 'outline'
    | 'ghost'
    | 'destructive';

export type BubbleWrapperProps = {
    /** Visual treatment of the bubble. */
    variant?: BubbleVariant;
    /** Inline alignment of the bubble within its container. */
    align?: 'start' | 'end';
    className?: string;
    /** Content rendered inside BubbleContent. */
    children: ReactNode;
    /** Render the BubbleContent as its child element (for link/button bubbles). */
    contentAsChild?: boolean;
    /** Reactions rendered inside BubbleReactions. When omitted, no reactions are shown. */
    reactions?: ReactNode;
    /** Side of the bubble to anchor the reactions row. */
    reactionsSide?: 'top' | 'bottom';
    /** Inline alignment of the reactions row. */
    reactionsAlign?: 'start' | 'end';
};
