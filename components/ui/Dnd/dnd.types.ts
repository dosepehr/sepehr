import type { ReactNode } from 'react';
import type { AttachmentState } from '@/components/ui/Attachment/attachment.types';

export type DndFile = {
    id: string;
    file?: File;
    name: string;
    size?: number;
    type?: string;
    /** Object URL or remote URL used for image/video preview. */
    previewUrl?: string;
    /** Marks a file that came from the server rather than a local drop/pick. */
    isExisting?: boolean;
    state?: AttachmentState;
    error?: string;
};

export type DndRejection = {
    fileName: string;
    reason: 'size' | 'type' | 'count';
    message: string;
};

export type DndWrapperProps = {
    value?: DndFile[];
    onChange?: (files: DndFile[]) => void;
    onRemove?: (file: DndFile) => void;
    onRejected?: (rejections: DndRejection[]) => void;

    /** MIME types / extensions accepted, e.g. `{ 'image/*': ['.png', '.jpg'] }`. */
    accept?: Record<string, string[]>;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    disabled?: boolean;

    label?: string;
    description?: string;
    error?: string;
    required?: boolean;

    /** Shows previews/list for the picked files instead of only reporting via onChange. */
    showPreview?: boolean;
    /** Confirms before removing a file. */
    confirmRemove?: boolean;
    confirmRemoveTitle?: string;
    confirmRemoveDescription?: string;

    placeholder?: ReactNode;
    className?: string;
};
