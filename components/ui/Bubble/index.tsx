'use client';
import type { FC } from 'react';
import type { BubbleWrapperProps } from './bubble.types';
import { Bubble, BubbleContent, BubbleReactions } from './components';

const BubbleWrapper: FC<BubbleWrapperProps> = ({
    variant = 'default',
    align = 'start',
    className,
    children,
    contentAsChild = false,
    reactions,
    reactionsSide = 'bottom',
    reactionsAlign = 'end',
}) => (
    <Bubble variant={variant} align={align} className={className}>
        <BubbleContent>{children}</BubbleContent>
        {reactions && (
            <BubbleReactions side={reactionsSide} align={reactionsAlign}>
                {reactions}
            </BubbleReactions>
        )}
    </Bubble>
);

export default BubbleWrapper;
