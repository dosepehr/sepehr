'use client';

import { cn } from '@/lib/funcs/cn';
import { FileIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import * as React from 'react';
import {
    createDndFile,
    formatAcceptedExtensions,
    formatFileSize,
    isPreviewableImage,
    validateFiles,
} from '@/lib/funcs/dnd.utils';
import AlertDialogWrapper from '@/components/ui/AlertDialog';
import AttachmentWrapper from '@/components/ui/Attachment';
import { AttachmentAction } from '@/components/ui/Attachment/components';
import Field, { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
import {
    DndFooter,
    DndInput,
    DndList,
    DndPreview,
    DndPreviewFooter,
    DndPreviewMedia,
    DndZone,
} from './components';
import type { DndFile, DndWrapperProps } from './dnd.types';

const DndWrapper = ({
    value,
    onChange = () => {},
    onRemove,
    onRejected,
    accept,
    multiple = false,
    maxFiles = multiple ? Infinity : 1,
    maxSizeMB = 50,
    disabled = false,
    label,
    description,
    error,
    required = false,
    showPreview = true,
    confirmRemove = false,
    confirmRemoveTitle = 'Remove file',
    confirmRemoveDescription = 'Are you sure you want to remove this file?',
    placeholder,
    className,
}: DndWrapperProps) => {
    const [internalFiles, setInternalFiles] = React.useState<DndFile[]>([]);
    const [dragging, setDragging] = React.useState(false);
    const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
        null,
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dragCounter = React.useRef(0);
    const isControlled = value !== undefined;
    const files = isControlled ? (value ?? []) : internalFiles;

    const isInvalid = !!error;
    const acceptedExtensions = accept ? formatAcceptedExtensions(accept) : '';

    const commit = (next: DndFile[]) => {
        if (!isControlled) {
            setInternalFiles(next);
        }
        onChange(next);
    };

    const addFiles = (fileList: FileList | File[]) => {
        const incoming = Array.from(fileList);
        const remainingSlots = multiple ? maxFiles - files.length : 1;

        const { accepted, rejections } = validateFiles(incoming, {
            accept,
            maxSizeMB,
            remainingSlots,
        });

        if (rejections.length > 0) {
            onRejected?.(rejections);
        }

        if (accepted.length === 0) {
            return;
        }

        const enriched = accepted.map(createDndFile);
        commit(multiple ? [...files, ...enriched] : [enriched[0]]);
    };

    const openFilePicker = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dragCounter.current = 0;
        setDragging(false);

        if (disabled || !event.dataTransfer.files.length) {
            return;
        }

        addFiles(event.dataTransfer.files);
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (disabled) return;
        dragCounter.current += 1;
        setDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            setDragging(false);
        }
    };

    const requestRemove = (file: DndFile) => {
        if (confirmRemove) {
            setPendingRemoveId(file.id);
        } else {
            removeFile(file.id);
        }
    };

    const removeFile = (id: string) => {
        const target = files.find((f) => f.id === id);

        if (target) {
            if (target.previewUrl && !target.isExisting) {
                URL.revokeObjectURL(target.previewUrl);
            }
            onRemove?.(target);
        }

        commit(files.filter((f) => f.id !== id));
        setPendingRemoveId(null);
    };

    React.useEffect(() => {
        return () => {
            for (const f of files) {
                if (f.previewUrl && !f.isExisting) {
                    URL.revokeObjectURL(f.previewUrl);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canAddMore = multiple ? files.length < maxFiles : files.length === 0;
    const hasPreview = showPreview && files.length > 0;

    // DndInput is rendered as a sibling, not a child, of the role="button"
    // zone — axe's nested-interactive rule flags a native interactive
    // element nested inside another interactive role regardless of
    // tabIndex/aria-hidden, since some assistive tech can still reach it.
    const dropzone = canAddMore && (
        <>
            <DndZone
                className={!multiple ? 'absolute inset-0' : undefined}
                dragging={dragging}
                disabled={disabled}
                invalid={isInvalid}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                onClick={openFilePicker}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openFilePicker();
                    }
                }}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
            >
                {placeholder ?? (
                    <>
                        <UploadIcon
                            strokeWidth={1.5}
                            className="size-10 text-muted-foreground"
                        />
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">
                                Drag & drop your file here
                            </p>
                            <p className="text-xs text-muted-foreground">
                                or click to browse from your device
                            </p>
                        </div>
                    </>
                )}
            </DndZone>

            <DndInput
                ref={inputRef}
                accept={accept ? Object.keys(accept).join(',') : undefined}
                multiple={multiple}
                disabled={disabled}
                onClick={(event) => {
                    event.stopPropagation();
                    (event.target as HTMLInputElement).value = '';
                }}
                onChange={(event) => {
                    if (event.target.files?.length) {
                        addFiles(event.target.files);
                    }
                }}
            />
        </>
    );

    const fileActions = (file: DndFile) => (
        <AttachmentAction
            aria-label={`Remove ${file.name}`}
            onClick={(event) => {
                event.stopPropagation();
                requestRemove(file);
            }}
        >
            <Trash2Icon />
        </AttachmentAction>
    );

    return (
        <Field
            data-invalid={isInvalid || undefined}
            className={cn('relative pb-1', className)}
        >
            {label && (
                <FieldLabel required={required} className="text-foreground">
                    {label}
                </FieldLabel>
            )}
            {description && (
                <FieldDescription className="text-muted-foreground">
                    {description}
                </FieldDescription>
            )}

            {multiple ? (
                <>
                    {dropzone}

                    {hasPreview && (
                        <DndList className={canAddMore ? 'mt-3' : undefined}>
                            {files.map((file) => (
                                <AttachmentWrapper
                                    key={file.id}
                                    name={file.name}
                                    description={
                                        file.error ?? formatFileSize(file.size)
                                    }
                                    state={
                                        file.error
                                            ? 'error'
                                            : (file.state ?? 'done')
                                    }
                                    imageSrc={
                                        isPreviewableImage(file)
                                            ? file.previewUrl
                                            : undefined
                                    }
                                    actions={fileActions(file)}
                                />
                            ))}
                        </DndList>
                    )}
                </>
            ) : (
                <div className="relative min-h-60">
                    {dropzone}

                    {hasPreview &&
                        files.map((file) => (
                            <DndPreview
                                key={file.id}
                                invalid={!!file.error}
                                className="absolute inset-0"
                            >
                                <DndPreviewMedia>
                                    {isPreviewableImage(file) ? (
                                        <img
                                            src={file.previewUrl}
                                            alt={file.name}
                                        />
                                    ) : (
                                        <FileIcon />
                                    )}
                                </DndPreviewMedia>
                                <DndPreviewFooter>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {file.name}
                                        </p>
                                        <p
                                            className={cn(
                                                'truncate text-xs',
                                                file.error
                                                    ? 'text-destructive-text'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {file.error ??
                                                formatFileSize(file.size)}
                                        </p>
                                    </div>
                                    {fileActions(file)}
                                </DndPreviewFooter>
                            </DndPreview>
                        ))}
                </div>
            )}

            {(acceptedExtensions || maxSizeMB) && (
                <DndFooter>
                    {acceptedExtensions && (
                        <span>Allowed formats: {acceptedExtensions}</span>
                    )}
                    <span>Max size: {maxSizeMB}MB</span>
                </DndFooter>
            )}

            {error && <FieldError>{error}</FieldError>}

            <AlertDialogWrapper
                open={!!pendingRemoveId}
                onOpenChange={(open) => !open && setPendingRemoveId(null)}
                title={confirmRemoveTitle}
                description={confirmRemoveDescription}
                intent="destructive"
                confirmLabel="Remove"
                actionProps={{
                    onClick: () =>
                        pendingRemoveId && removeFile(pendingRemoveId),
                }}
            />
        </Field>
    );
};

export default DndWrapper;
export type { DndFile, DndRejection, DndWrapperProps } from './dnd.types';
