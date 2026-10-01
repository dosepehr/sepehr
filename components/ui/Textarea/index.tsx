'use client';

import { useId } from 'react';
import Field, { FieldDescription, FieldError, FieldLabel } from '@/components/ui/Field';
import { Textarea } from './components';
import type { TextareaWrapperProps } from './textarea.types';

const TextareaWrapper = ({
    label,
    description,
    error,
    required,
    id,
    ...props
}: TextareaWrapperProps) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <Field
            data-invalid={error ? true : undefined}
            className="relative pb-1"
        >
            {label && (
                <FieldLabel
                    htmlFor={textareaId}
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
            <Textarea
                id={textareaId}
                aria-invalid={error ? true : undefined}
                {...props}
            />
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
};

export default TextareaWrapper;
