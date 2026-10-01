'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import ComboBox from '@/components/ui/ComboBox';
import { type ComboBoxProps } from '@/components/ui/ComboBox/combo-box.types';

export type ControlledComboBoxProps<T extends FieldValues> = Omit<
    ComboBoxProps,
    'value' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    customOnChange?: (value: string) => void;
};

export const ControlledComboBox = <T extends FieldValues>({
    name,
    control,
    customOnChange,
    error,
    ...props
}: ControlledComboBoxProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <ComboBox
                {...props}
                value={field.value ? String(field.value) : ''}
                onChange={(val) => {
                    field.onChange(val);
                    customOnChange?.(val);
                }}
                error={!field.value ? (error ?? fieldState.error?.message) : ''}
            />
        )}
    />
);
