'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import * as React from 'react';
import { CommandContext } from './components';

function getVisibleItems(listRef: React.RefObject<HTMLDivElement | null>) {
    if (!listRef.current) return [];
    return Array.from(
        listRef.current.querySelectorAll<HTMLElement>('[data-command-item]'),
    ).filter((el) => el.style.display !== 'none');
}

const Command = ({
    children,
    shouldFilter = true,
    className,
    onSearchChange,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    shouldFilter?: boolean;
    onSearchChange?: (val: string) => void;
}) => {
    const [search, setSearch] = React.useState('');
    const [activeValue, setActiveValue] = React.useState('');
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const listId = React.useId();

    const handleSetSearch: React.Dispatch<React.SetStateAction<string>> =
        React.useCallback(
            (val) => {
                /* c8 ignore next */
                const next = typeof val === 'function' ? val(search) : val;
                setSearch(next);
                onSearchChange?.(next);
            },
            [search, onSearchChange],
        );

    // Re-highlight the first visible item whenever the result set changes,
    // matching standard command-palette behavior (VS Code, Spotlight).
    React.useEffect(() => {
        const items = getVisibleItems(listRef);
        setActiveValue(items[0]?.dataset.value ?? '');
    }, [search]);

    const moveActive = React.useCallback(
        (direction: 'next' | 'prev' | 'first' | 'last') => {
            const items = getVisibleItems(listRef);
            if (items.length === 0) return;

            const currentIndex = items.findIndex(
                (el) => el.dataset.value === activeValue,
            );

            let nextIndex: number;
            if (direction === 'first') nextIndex = 0;
            else if (direction === 'last') nextIndex = items.length - 1;
            else if (direction === 'next')
                nextIndex =
                    currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            else
                nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : items.length - 1;

            const nextItem = items[nextIndex];
            setActiveValue(nextItem.dataset.value ?? '');
            nextItem.scrollIntoView({ block: 'nearest' });
        },
        [activeValue],
    );

    const selectActive = React.useCallback(() => {
        getVisibleItems(listRef)
            .find((el) => el.dataset.value === activeValue)
            ?.click();
    }, [activeValue]);

    return (
        <CommandContext.Provider
            value={{
                search,
                setSearch: handleSetSearch,
                shouldFilter,
                listRef,
                listId,
                activeValue,
                setActiveValue,
                moveActive,
                selectActive,
            }}
        >
            <div
                className={cn(
                    'flex flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        </CommandContext.Provider>
    );
};

export {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from './components';

export default Command;
