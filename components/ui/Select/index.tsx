'use client';

import { cn } from '@/lib/funcs/cn';
import { useId } from 'react';
import Field, { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './components';
import type { SelectWrapperProps } from './select.types';

const SelectWrapper = ({
    label,
    description,
    error,
    required,
    placeholder,
    options = [],
    value,
    onValueChange,
    disabled,
    isLoading,
    isError,
    className,
    triggerClassName,
    startAddon,
    'aria-label': ariaLabel,
}: SelectWrapperProps) => {
    const generatedId = useId();
    const isInvalid = !!error;

    return (
        <Field
            data-invalid={isInvalid || undefined}
            className={cn('relative pb-1', className)}
        >
            {label && (
                <FieldLabel
                    htmlFor={generatedId}
                    required={required}
                    className="text-foreground"
                >
                    {label}
                </FieldLabel>
            )}
            {description && (
                <FieldDescription className="text-muted-foreground">
                    {description}
                </FieldDescription>
            )}
            <Select
                value={value}
                onValueChange={onValueChange}
                disabled={disabled || isLoading || isError}
            >
                <SelectTrigger
                    id={generatedId}
                    aria-invalid={isInvalid || undefined}
                    aria-label={label ? undefined : ariaLabel}
                    className={triggerClassName}
                >
                    <span className="flex flex-1 items-center gap-2 overflow-hidden">
                        {startAddon && (
                            <span className="shrink-0 text-muted-foreground">
                                {startAddon}
                            </span>
                        )}
                        <SelectValue
                            placeholder={
                                isLoading
                                    ? 'Loading...'
                                    : isError
                                      ? 'Failed to load'
                                      : placeholder
                            }
                        />
                    </span>
                </SelectTrigger>
                {!isLoading && !isError && (
                    <SelectContent position="popper">
                        {options.length === 0 && (
                            <div className="flex cursor-default items-center justify-center py-3 text-xs text-muted-foreground select-none">
                                No options available
                            </div>
                        )}
                        {options.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                )}
            </Select>
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
};

export default SelectWrapper;
