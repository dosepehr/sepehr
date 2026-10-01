'use client';

import { Check, Clock, FileText, FileWarning } from 'lucide-react';
import type { FC } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';
import type {
    AttachmentState,
    AttachmentWrapperProps,
} from './attachment.types';
import {
    Attachment,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
    AttachmentTrigger,
} from './components';

const defaultIconByState: Record<AttachmentState, React.ReactNode> = {
    idle: <Clock />,
    uploading: <Spinner />,
    processing: <FileText />,
    error: <FileWarning />,
    done: <Check />,
};

const AttachmentWrapper: FC<AttachmentWrapperProps> = ({
    name,
    description,
    icon,
    icons,
    imageSrc,
    imageAlt,
    state = 'done',
    size,
    orientation,
    actions,
    onPress,
    href,
    className,
}) => {
    const hasTrigger = !!(onPress || href);
    const isLoading = state === 'uploading' || state === 'processing';
    const resolvedIcon = icon ?? icons?.[state] ?? defaultIconByState[state];

    return (
        <Attachment
            state={state}
            size={size}
            orientation={orientation}
            className={className}
        >
            <AttachmentMedia variant={imageSrc ? 'image' : 'icon'}>
                {imageSrc ? (
                    <img src={imageSrc} alt={imageAlt ?? name} />
                ) : (
                    resolvedIcon
                )}
            </AttachmentMedia>

            <AttachmentContent>
                <AttachmentTitle>{name}</AttachmentTitle>
                {description ? (
                    <AttachmentDescription>{description}</AttachmentDescription>
                ) : isLoading ? (
                    <Skeleton className="mt-1 h-3 w-24" />
                ) : null}
            </AttachmentContent>

            {actions && <AttachmentActions>{actions}</AttachmentActions>}

            {hasTrigger &&
                (href ? (
                    <AttachmentTrigger asChild><a href={href} aria-label={name} /></AttachmentTrigger>
                ) : (
                    <AttachmentTrigger onClick={onPress} />
                ))}
        </Attachment>
    );
};

export default AttachmentWrapper;
