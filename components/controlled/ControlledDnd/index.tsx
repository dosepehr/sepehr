'use client';

import {
    Controller,
    type Control,
    type FieldValues,
    type Path,
} from 'react-hook-form';
import Dnd from '@/components/ui/Dnd';
import type { DndFile, DndWrapperProps } from '@/components/ui/Dnd/dnd.types';

export type ControlledDndProps<T extends FieldValues> = Omit<
    DndWrapperProps,
    'value' | 'onChange'
> & {
    name: Path<T>;
    control: Control<T>;
    onFilesChange?: (files: DndFile[]) => void;
};

export const ControlledDnd = <T extends FieldValues>({
    name,
    control,
    onFilesChange,
    error,
    ...props
}: ControlledDndProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
            <Dnd
                {...props}
                value={field.value ?? []}
                onChange={(files) => {
                    field.onChange(files);
                    onFilesChange?.(files);
                }}
                error={error ?? fieldState.error?.message}
            />
        )}
    />
);
