'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import MultiInput from '@/components/ui/MultiInput';
import { type MultiInputProps } from '@/components/ui/MultiInput/multi-input.types';

export type ControlledMultiInputProps<T extends FieldValues> = Omit<
    MultiInputProps,
    'value' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    onValueChange?: (values: string[]) => void;
};

export const ControlledMultiInput = <T extends FieldValues>({
    name,
    control,
    onValueChange,
    error,
    ...props
}: ControlledMultiInputProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <MultiInput
                {...props}
                value={field.value ?? []}
                onChange={(values) => {
                    field.onChange(values);
                    onValueChange?.(values);
                }}
                error={error ?? fieldState.error?.message}
            />
        )}
    />
);
