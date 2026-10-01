'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import DatePicker from '@/components/ui/DatePicker';
import { type DatePickerProps } from '@/components/ui/DatePicker/date-picker.types';

export type ControlledDatePickerProps<T extends FieldValues> = Omit<
    DatePickerProps,
    'value' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    onValueChange?: (date: Date | undefined) => void;
};

export const ControlledDatePicker = <T extends FieldValues>({
    name,
    control,
    onValueChange,
    error,
    ...props
}: ControlledDatePickerProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <DatePicker
                {...props}
                value={field.value}
                onChange={(date) => {
                    field.onChange(date);
                    onValueChange?.(date);
                }}
                error={error ?? fieldState.error?.message}
            />
        )}
    />
);
