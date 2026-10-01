'use client';

import {
    Item,
    ItemContent,
    ItemDescription,
    ItemEnd,
    ItemMedia,
    ItemTitle,
} from './components';
import type { ItemWrapperProps } from './item.types';

const ItemWrapper = ({
    title,
    description,
    media,
    mediaVariant = 'icon',
    end,
    children,
    ...props
}: ItemWrapperProps) => {
    return (
        <Item {...props}>
            {media && <ItemMedia variant={mediaVariant}>{media}</ItemMedia>}
            {(title || description) && (
                <ItemContent>
                    {title && <ItemTitle>{title}</ItemTitle>}
                    {description && (
                        <ItemDescription>{description}</ItemDescription>
                    )}
                </ItemContent>
            )}
            {children}
            {end && <ItemEnd>{end}</ItemEnd>}
        </Item>
    );
};

export default ItemWrapper;
