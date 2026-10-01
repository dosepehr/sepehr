'use client';

import { cn } from '@/lib/funcs/cn';
import type { FC } from 'react';
import { useId } from 'react';
import Asteriks from '@/components/ui/Asteriks';
import Label from '@/components/ui/Label';
import type { CheckboxWrapperProps } from './checkbox.types';
import { Checkbox, checkboxWrapperVariants } from './components';

const CheckboxWrapper: FC<CheckboxWrapperProps> = ({
    id,
    label,
    description,
    variant,
    className,
    disabled,
    required,
    ...props
}) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
        <Label
            disabled={disabled}
            className={cn(
                checkboxWrapperVariants({ variant }),
                disabled && 'cursor-not-allowed! opacity-80',
                className,
            )}
        >
            <Checkbox
                id={checkboxId}
                variant={variant}
                disabled={disabled}
                className="mt-0.5"
                {...props}
            />
            <div className="grid gap-1 font-normal">
                {label && (
                    <span className="flex items-center gap-1 text-sm leading-none font-medium">
                        {label}
                        {required && <Asteriks />}
                    </span>
                )}
                {description && (
                    <span className="text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </div>
        </Label>
    );
};

export default CheckboxWrapper;
