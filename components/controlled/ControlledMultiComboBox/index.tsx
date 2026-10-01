'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import MultiComboBox from '@/components/ui/MultiComboBox';
import { type MultiComboBoxProps } from '@/components/ui/MultiComboBox/multi-combo-box.types';

export type ControlledMultiComboBoxProps<T extends FieldValues> = Omit<
    MultiComboBoxProps,
    'selected' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    transformToForm?: (values: string[]) => unknown[];
    transformFromForm?: (values: unknown[]) => string[];
    onValueChange?: (values: string[]) => void;
};

export const ControlledMultiComboBox = <T extends FieldValues>({
    name,
    control,
    transformToForm = (v) => v,
    transformFromForm = (v) => v as string[],
    onValueChange,
    error,
    ...props
}: ControlledMultiComboBoxProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <MultiComboBox
                {...props}
                selected={transformFromForm(field.value ?? [])}
                onChange={(values) => {
                    field.onChange(transformToForm(values));
                    onValueChange?.(values);
                }}
                error={error ?? fieldState.error?.message}
            />
        )}
    />
);
