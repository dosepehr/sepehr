'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { Plus, X } from 'lucide-react';
import { useId, useState, type KeyboardEvent } from 'react';
import Badge from '@/components/ui/Badge';
import Field, { FieldError, FieldLabel } from '@/components/ui/Field';
import type { MultiInputProps } from './multi-input.types';

const MultiInput = ({
    value = [],
    onChange,
    label,
    placeholder = 'Add item...',
    required = false,
    error,
    disabled = false,
    maxLength,
    className,
}: MultiInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const inputId = useId();
    const isInvalid = !!error;

    const add = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed || value.includes(trimmed)) return;
        if (maxLength && trimmed.length > maxLength) return;
        onChange?.([...value, trimmed]);
        setInputValue('');
    };

    const remove = (val: string) => {
        onChange?.(value.filter((v) => v !== val));
    };

    return (
        <Field
            data-invalid={isInvalid || undefined}
            className={cn('relative pb-1', className)}
        >
            {label && (
                <FieldLabel
                    htmlFor={inputId}
                    required={required}
                    className="text-foreground"
                >
                    {label}
                </FieldLabel>
            )}

            <div
                className={cn(
                    'flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow,border] outline-none',
                    'border-input/50',
                    !disabled &&
                        !isInvalid &&
                        'focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/50',
                    'data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/50',
                    disabled && 'cursor-not-allowed opacity-50',
                )}
                data-invalid={isInvalid || undefined}
            >
                <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                    id={inputId}
                    type="text"
                    disabled={disabled}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={add}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
            </div>

            {value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {value.map((val) => (
                        <Badge key={val} variant="default" appearance="soft">
                            {val}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => remove(val)}
                                    aria-label={`Remove ${val}`}
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

export default MultiInput;
