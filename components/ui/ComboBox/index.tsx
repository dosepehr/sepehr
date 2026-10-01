'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { CheckIcon, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import * as React from 'react';
import { useId } from 'react';
import Command, {
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/Command';
import Field, { FieldError, FieldLabel } from '@/components/ui/Field';
import Popover, { PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import type { ComboBoxProps } from './combo-box.types';

const ComboBox: React.FC<ComboBoxProps> = ({
    options,
    value,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    notFoundText = 'No results found.',
    onChange,
    className,
    disabled = false,
    label,
    error,
    isPending,
    isError,
    required = false,
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

    const selected = options.find((opt) => opt.value === value);
    const displayLabel: ReactNode = selected ? selected.label : placeholder;

    const hasVisibleItems = React.useMemo(() => {
        const q = commandSearch.toLowerCase();
        if (!q) return options.length > 0;
        return options.some((opt) => {
            /* c8 ignore next */
            const label = typeof opt.label === 'string' ? opt.label : '';
            return (
                opt.value.toLowerCase().includes(q) ||
                label.toLowerCase().includes(q)
            );
        });
    }, [commandSearch, options]);

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
                <PopoverTrigger asChild><button id={triggerId} type="button" role="combobox" disabled={disabled || isPending || isError} aria-expanded={open} aria-controls={listboxId} aria-invalid={isInvalid || undefined} className={cn(
                                            'group/trigger flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow,border] outline-none select-none',
                                            'border-input/50 hover:enabled:not-aria-invalid:border-primary',
                                            'aria-expanded:not-aria-invalid:border-primary aria-expanded:not-aria-invalid:ring-3 aria-expanded:not-aria-invalid:ring-primary/50',
                                            'disabled:cursor-not-allowed disabled:opacity-50',
                                            'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/50 aria-invalid:hover:border-destructive',
                                        )}><span
                                            className={cn(
                                                'flex-1 truncate text-start',
                                                selected
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {isPending
                                                ? 'Loading...'
                                                : isError
                                                  ? 'Failed to load'
                                                  : displayLabel}
                                        </span><ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                                                open && 'rotate-180',
                                            )}
                                        /></button></PopoverTrigger>

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
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            keywords={[
                                                /* c8 ignore next */
                                                typeof option.label === 'string'
                                                    ? option.label
                                                    : '',
                                            ]}
                                            className={cn(
                                                'mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none first:mt-0',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                value === option.value &&
                                                    'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                                            )}
                                            onSelect={(currentValue) => {
                                                onChange?.(
                                                    currentValue === value
                                                        ? ''
                                                        : currentValue,
                                                );
                                                setOpen(false);
                                            }}
                                        >
                                            <span className="flex-1 truncate">
                                                {option.label}
                                            </span>
                                            <CheckIcon
                                                className={cn(
                                                    'size-3.5 shrink-0 transition-opacity',
                                                    value === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>

            <FieldError>{error}</FieldError>
        </Field>
    );
};

export default ComboBox;
