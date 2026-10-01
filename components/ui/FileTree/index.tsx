'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { FileTreeNode } from './components';
import { type FileTreeProps } from './file-tree.types';

const FileTree = ({ items, className }: FileTreeProps) => {
    return (
        <div className={cn('flex flex-col', className)}>
            {items.map((item, i) => (
                <FileTreeNode key={`${item.name}-${i}`} item={item} />
            ))}
        </div>
    );
};

export { FileTreeNode } from './components';

export default FileTree;
