'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import OtpInput from '@/components/ui/OtpInput';
import { type OtpInputProps } from '@/components/ui/OtpInput/otp-input.types';

export type ControlledOtpInputProps<T extends FieldValues> = Omit<
    OtpInputProps,
    'value' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    onValueChange?: (value: string) => void;
};

export const ControlledOtpInput = <T extends FieldValues>({
    name,
    control,
    onValueChange,
    error,
    ...props
}: ControlledOtpInputProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <OtpInput
                {...props}
                value={field.value ?? ''}
                onChange={(val) => {
                    field.onChange(val);
                    onValueChange?.(val);
                }}
                error={error ?? fieldState.error?.message}
            />
        )}
    />
);
