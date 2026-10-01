'use client';
/* c8 ignore stop */

import {
    ChevronRightIcon,
    FileIcon,
    FolderIcon,
    FolderOpenIcon,
} from 'lucide-react';
import * as React from 'react';
import Collapsible, {
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { type FileTreeItem } from './file-tree.types';

const FolderNode = ({
    item,
    depth,
}: {
    item: FileTreeItem & { items: FileTreeItem[] };
    depth: number;
}) => {
    const [open, setOpen] = React.useState(depth === 0);
    const indent = depth * 12;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger render={<button style={{ paddingLeft: `${indent + 4}px` }} className="group flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-sm text-foreground hover:bg-muted" />}><ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />{item.icon ??
                                    (open ? (
                                        <FolderOpenIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                    ))}<span className="truncate">{item.name}</span></CollapsibleTrigger>
            <CollapsibleContent>
                <div className="flex flex-col">
                    {item.items.map((child, i) => (
                        <FileTreeNode
                            key={`${child.name}-${i}`}
                            item={child}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

const FileTreeNode = ({
    item,
    depth = 0,
}: {
    item: FileTreeItem;
    depth?: number;
}) => {
    if ('items' in item) {
        return <FolderNode item={item} depth={depth} />;
    }

    const indent = depth * 12;

    return (
        <button
            style={{ paddingLeft: `${indent + 20}px` }}
            className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
            {item.icon ?? <FileIcon className="size-3.5 shrink-0" />}
            <span className="truncate">{item.name}</span>
        </button>
    );
};

export { FileTreeNode };
