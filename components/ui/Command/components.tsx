'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { Search } from 'lucide-react';
import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/Dialog/components';

interface CommandContextValue {
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    shouldFilter: boolean;
    listRef: React.RefObject<HTMLDivElement | null>;
    listId: string;
    activeValue: string;
    setActiveValue: React.Dispatch<React.SetStateAction<string>>;
    moveActive: (direction: 'next' | 'prev' | 'first' | 'last') => void;
    selectActive: () => void;
}

function handleListNavigationKeyDown(
    event: React.KeyboardEvent,
    ctx: Pick<CommandContextValue, 'moveActive' | 'selectActive'>,
) {
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            ctx.moveActive('next');
            break;
        case 'ArrowUp':
            event.preventDefault();
            ctx.moveActive('prev');
            break;
        case 'Home':
            event.preventDefault();
            ctx.moveActive('first');
            break;
        case 'End':
            event.preventDefault();
            ctx.moveActive('last');
            break;
        case 'Enter':
            event.preventDefault();
            ctx.selectActive();
            break;
        default:
            break;
    }
}

export const CommandContext = React.createContext<CommandContextValue | null>(
    null,
);

function useCommandContext() {
    const ctx = React.useContext(CommandContext);
    if (!ctx)
        throw new Error('Command components must be used within <Command>');
    return ctx;
}

const CommandInput = ({
    className,
    placeholder,
    value,
    onValueChange,
    // Command used standalone (e.g. a command palette) needs its input to
    // own the combobox role/relationship. Composites like ComboBox/
    // MultiComboBox already expose role="combobox" on their own trigger
    // button and use CommandInput purely as the popup's filter field, so
    // they set this to false to avoid a second, conflicting combobox role.
    ownsComboboxRole = true,
    ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onValueChange?: (val: string) => void;
    ownsComboboxRole?: boolean;
}) => {
    const ctx = useCommandContext();
    const { search, setSearch, listId, activeValue } = ctx;
    const isControlled = value !== undefined;
    const inputValue = isControlled ? (value as string) : search;

    return (
        <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                role={ownsComboboxRole ? 'combobox' : undefined}
                aria-expanded={ownsComboboxRole ? true : undefined}
                aria-controls={ownsComboboxRole ? listId : undefined}
                aria-autocomplete={ownsComboboxRole ? 'list' : undefined}
                aria-activedescendant={
                    activeValue ? `${listId}-${activeValue}` : undefined
                }
                className={cn(
                    'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                    const val = e.target.value;
                    if (!isControlled) setSearch(val);
                    onValueChange?.(val);
                }}
                onKeyDown={(e) => handleListNavigationKeyDown(e, ctx)}
                {...props}
            />
        </div>
    );
};

const CommandList = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const ctx = useCommandContext();
    const { listRef, listId } = ctx;
    return (
        <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={0}
            aria-label="Suggestions"
            className={cn(className)}
            onKeyDown={(e) => handleListNavigationKeyDown(e, ctx)}
            {...props}
        >
            {children}
        </div>
    );
};

const CommandEmpty = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const { listRef } = useCommandContext();
    const [isEmpty, setIsEmpty] = React.useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useLayoutEffect(() => {
        if (!listRef.current) return;
        const items = listRef.current.querySelectorAll('[data-command-item]');
        const visibleCount = Array.from(items).filter(
            (el) => (el as HTMLElement).style.display !== 'none',
        ).length;
        setIsEmpty(visibleCount === 0);
    });

    if (!isEmpty) return null;

    return (
        <div
            className={cn(
                'py-6 text-center text-sm text-muted-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
};

const CommandGroup = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn('overflow-hidden p-1', className)}
            role="group"
            {...props}
        >
            {children}
        </div>
    );
};

const CommandItem = ({
    children,
    value = '',
    keywords = [],
    className,
    onSelect,
    dir,
    ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
    value?: string;
    keywords?: string[];
    onSelect?: (value: string) => void;
    dir?: string;
}) => {
    const { search, shouldFilter, listId, activeValue, setActiveValue } =
        useCommandContext();
    const isActive = activeValue === value;

    const isVisible = React.useMemo(() => {
        if (!shouldFilter || !search) return true;
        const q = search.toLowerCase();
        return (
            value.toLowerCase().includes(q) ||
            keywords.some((k) => k.toLowerCase().includes(q))
        );
    }, [search, shouldFilter, value, keywords]);

    return (
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/click-events-have-key-events -- intentionally not focusable: keyboard nav is handled via aria-activedescendant on CommandInput/CommandList (see handleListNavigationKeyDown), matching the standard combobox/listbox pattern
        <div
            data-command-item=""
            data-value={value}
            id={`${listId}-${value}`}
            role="option"
            aria-selected={isActive}
            style={{ display: isVisible ? undefined : 'none' }}
            className={cn(
                'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
                className,
            )}
            /* c8 ignore next */
            onClick={() => isVisible && onSelect?.(value)}
            onMouseEnter={() => setActiveValue(value)}
            dir={dir}
            {...props}
        >
            {children}
        </div>
    );
};

const CommandDialog = ({
    title = 'Command Palette',
    description = 'Search for a command to run...',
    children,
    className,
    ...props
}: React.ComponentProps<typeof Dialog> & {
    title?: string;
    description?: string;
    className?: string;
}) => {
    return (
        <Dialog {...props}>
            <DialogContent className={cn('overflow-hidden p-0', className)}>
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <DialogDescription className="sr-only">
                    {description}
                </DialogDescription>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
};
