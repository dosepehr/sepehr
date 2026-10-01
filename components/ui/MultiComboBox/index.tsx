'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { CheckIcon, ChevronDown, X } from 'lucide-react';
import * as React from 'react';
import { useCallback, useId, useMemo } from 'react';
import Badge from '@/components/ui/Badge';
import Command, {
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/Command';
import Field, { FieldError, FieldLabel } from '@/components/ui/Field';
import Popover, { PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import type { MultiComboBoxProps } from './multi-combo-box.types';

const MultiComboBox: React.FC<MultiComboBoxProps> = ({
    options,
    selected,
    onChange,
    placeholder = 'Select options',
    searchPlaceholder = 'Search...',
    notFoundText = 'No results found.',
    label,
    required = false,
    disabled = false,
    isPending = false,
    isError = false,
    error,
    hideSelectedBadges = false,
    className,
}) => {
    const [open, setOpen] = React.useState(false);
    const [commandSearch, setCommandSearch] = React.useState('');
    const triggerId = useId();
    const listboxId = useId();
    const isInvalid = !!error;

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) setCommandSearch('');
    };

    const toggle = useCallback(
        (value: string) => {
            if (!onChange) return;
            const next = selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value];
            onChange(next);
        },
        [selected, onChange],
    );

    const remove = useCallback(
        (value: string, e?: React.MouseEvent) => {
            e?.stopPropagation();
            onChange?.(selected.filter((v) => v !== value));
        },
        [selected, onChange],
    );

    const selectedOptions = useMemo(
        () => options.filter((opt) => selected.includes(opt.value)),
        [options, selected],
    );

    const hasVisibleItems = useMemo(() => {
        const q = commandSearch.toLowerCase();
        if (!q) return options.length > 0;
        return options.some(
            (opt) =>
                opt.value.toLowerCase().includes(q) ||
                opt.label.toLowerCase().includes(q),
        );
    }, [commandSearch, options]);

    const triggerText = isPending
        ? 'Loading...'
        : isError
          ? 'Failed to load'
          : selected.length > 0
            ? `${selected.length} selected`
            : placeholder;

    return (
        <Field
            data-invalid={isInvalid || undefined}
            className={cn('relative pb-1', className)}
        >
            {label && (
                <FieldLabel
                    htmlFor={triggerId}
                    required={required}
                    className="text-foreground"
                >
                    {label}
                </FieldLabel>
            )}

            <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
                <PopoverTrigger render={<button id={triggerId} type="button" role="combobox" disabled={disabled || isPending || isError} aria-expanded={open} aria-controls={listboxId} aria-invalid={isInvalid || undefined} className={cn(
                                            'group/trigger flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow,border] outline-none select-none',
                                            'border-input/50 hover:enabled:not-aria-invalid:border-primary',
                                            'aria-expanded:not-aria-invalid:border-primary aria-expanded:not-aria-invalid:ring-3 aria-expanded:not-aria-invalid:ring-primary/50',
                                            'disabled:cursor-not-allowed disabled:opacity-50',
                                            'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/50 aria-invalid:hover:border-destructive',
                                        )} />}><span
                                            className={cn(
                                                'flex-1 truncate text-start',
                                                selected.length > 0
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {triggerText}
                                        </span><ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                                                open && 'rotate-180',
                                            )}
                                        /></PopoverTrigger>

                <PopoverContent
                    className="popover-content-width-full rounded-lg border-0 p-0 shadow-md ring-1 ring-foreground/10"
                    sideOffset={5}
                >
                    <Command onSearchChange={setCommandSearch}>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            ownsComboboxRole={false}
                        />
                        <div
                            className="max-h-40 overflow-y-auto"
                            onWheel={(e) => e.stopPropagation()}
                        >
                            <CommandList id={listboxId}>
                                {!hasVisibleItems && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        {notFoundText}
                                    </div>
                                )}
                                <CommandGroup>
                                    {options.map((option) => {
                                        const isSelected = selected.includes(
                                            option.value,
                                        );
                                        return (
                                            <CommandItem
                                                key={option.value}
                                                value={option.value}
                                                keywords={[option.label]}
                                                className={cn(
                                                    'mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none first:mt-0',
                                                    'hover:bg-accent hover:text-accent-foreground',
                                                    isSelected &&
                                                        'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                                                )}
                                                onSelect={() =>
                                                    toggle(option.value)
                                                }
                                            >
                                                <span className="flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                <CheckIcon
                                                    className={cn(
                                                        'size-3.5 shrink-0 transition-opacity',
                                                        isSelected
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>

            {!hideSelectedBadges && selectedOptions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedOptions.map((opt) => (
                        <Badge
                            key={opt.value}
                            variant="default"
                            appearance="soft"
                        >
                            {opt.label}
                            {!disabled && !isPending && (
                                <button
                                    type="button"
                                    onClick={(e) => remove(opt.value, e)}
                                    aria-label={`Remove ${opt.label}`}
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </Badge>
                    ))}
                </div>
            )}

            <FieldError>{error}</FieldError>
        </Field>
    );
};

export default MultiComboBox;
