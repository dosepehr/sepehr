import type { ReactNode } from 'react';
import type { Matcher } from 'react-day-picker';

export type DatePickerProps = {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    disabledDates?: Matcher | Matcher[];
    className?: string;
    triggerClassName?: string;
    format?: string;
    startAddon?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};
