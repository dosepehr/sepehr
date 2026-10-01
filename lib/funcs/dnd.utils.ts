import type { DndFile, DndRejection } from '@/components/ui/Dnd/dnd.types';

const PREVIEWABLE_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
];

export function createDndFile(file: File): DndFile {
    return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        state: 'done',
    };
}

export function isPreviewableImage(file: DndFile) {
    return (
        !!file.previewUrl && PREVIEWABLE_IMAGE_TYPES.includes(file.type ?? '')
    );
}

export function formatFileSize(bytes?: number) {
    if (!bytes) return;

    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const size = bytes / 1024 ** exponent;

    return `${exponent === 0 ? size : size.toFixed(1)} ${units[exponent]}`;
}

export function formatAcceptedExtensions(accept: Record<string, string[]>) {
    return Object.values(accept)
        .flat()
        .map((ext) => ext.replace(/^\./, '').toUpperCase())
        .join(', ');
}

function matchesAccept(file: File, accept?: Record<string, string[]>) {
    if (!accept) return true;

    const extensions = Object.values(accept).flat();
    const mimePatterns = Object.keys(accept);
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    const matchesMime = mimePatterns.some((pattern) => {
        if (pattern.endsWith('/*')) {
            return file.type.startsWith(pattern.replace('/*', '/'));
        }
        return file.type === pattern;
    });

    const matchesExtension = extensions.some(
        (ext) => ext.toLowerCase() === fileExtension,
    );

    return matchesMime || matchesExtension;
}

type ValidateOptions = {
    accept?: Record<string, string[]>;
    maxSizeMB: number;
    remainingSlots: number;
};

export function validateFiles(
    files: File[],
    { accept, maxSizeMB, remainingSlots }: ValidateOptions,
) {
    const accepted: File[] = [];
    const rejections: DndRejection[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
        if (accepted.length >= remainingSlots) {
            rejections.push({
                fileName: file.name,
                reason: 'count',
                message: `Only ${remainingSlots} more file(s) can be added.`,
            });
            continue;
        }

        if (!matchesAccept(file, accept)) {
            rejections.push({
                fileName: file.name,
                reason: 'type',
                message: `"${file.name}" has an unsupported file type.`,
            });
            continue;
        }

        if (file.size > maxSizeBytes) {
            rejections.push({
                fileName: file.name,
                reason: 'size',
                message: `"${file.name}" exceeds the ${maxSizeMB}MB size limit.`,
            });
            continue;
        }

        accepted.push(file);
    }

    return { accepted, rejections };
}
