'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { useId, useState } from 'react';
import Field, { FieldError, FieldLabel } from '@/components/ui/Field';
import { InputComponent as Input } from '@/components/ui/Input/components';
import type { PasswordInputProps } from './password-input.types';

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, required, className, id, ...props }, ref) => {
        const [show, setShow] = useState(false);
        const generatedId = useId();
        const inputId = id ?? generatedId;
        const isInvalid = !!error;

        return (
            <Field
                data-invalid={isInvalid || undefined}
                className="relative pb-1"
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

                <div className="relative">
                    <Input
                        ref={ref}
                        id={inputId}
                        type={show ? 'text' : 'password'}
                        aria-invalid={isInvalid || undefined}
                        className={cn('pe-9', className)}
                        {...props}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShow((s) => !s)}
                        className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={show ? 'Hide password' : 'Show password'}
                    >
                        {show ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </button>
                </div>

                {error && <FieldError>{error}</FieldError>}
            </Field>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
