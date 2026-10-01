import type * as React from 'react';

export type FileTreeItem =
    | { name: string; icon?: React.ReactNode }
    | { name: string; icon?: React.ReactNode; items: FileTreeItem[] };

export type FileTreeProps = {
    items: FileTreeItem[];
    className?: string;
};
