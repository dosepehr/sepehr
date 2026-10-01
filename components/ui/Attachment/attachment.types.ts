import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { attachmentVariants } from './components';

export type AttachmentState =
    | 'idle'
    | 'uploading'
    | 'processing'
    | 'error'
    | 'done';

export type AttachmentWrapperProps = VariantProps<typeof attachmentVariants> & {
    name: string;
    state?: AttachmentState;
    description?: string;
    /** Overrides the icon for every state. Takes priority over `icons`. */
    icon?: ReactNode;
    /** Per-state icon map. Merged with built-in defaults; `icon` still wins. */
    icons?: Partial<Record<AttachmentState, ReactNode>>;
    imageSrc?: string;
    imageAlt?: string;
    actions?: ReactNode;
    onPress?: () => void;
    href?: string;
    className?: string;
};
