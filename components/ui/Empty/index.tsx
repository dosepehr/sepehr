import type { FC } from 'react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from './components';
import type { EmptyWrapperProps } from './empty.types';

const EmptyWrapper: FC<EmptyWrapperProps> = ({
    title,
    description,
    icon,
    mediaVariant = 'icon',
    action,
    className,
}) => {
    return (
        <Empty className={className}>
            <EmptyHeader>
                {icon && <EmptyMedia variant={mediaVariant}>{icon}</EmptyMedia>}
                <EmptyTitle>{title}</EmptyTitle>
                {description && (
                    <EmptyDescription>{description}</EmptyDescription>
                )}
            </EmptyHeader>
            {action && <EmptyContent>{action}</EmptyContent>}
        </Empty>
    );
};

export default EmptyWrapper;
