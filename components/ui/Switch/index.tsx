'use client';

import { cn } from '@/lib/funcs/cn';
import type { FC } from 'react';
import { useId } from 'react';
import Asteriks from '@/components/ui/Asteriks';
import Label from '@/components/ui/Label';
import { Switch, switchWrapperVariants } from './components';
import type { SwitchWrapperProps } from './switch.types';

const SwitchWrapper: FC<SwitchWrapperProps> = ({
    id,
    label,
    description,
    variant,
    size,
    className,
    disabled,
    required,
    ...props
}) => {
    const generatedId = useId();
    const switchId = id ?? generatedId;

    return (
        <Label
            disabled={disabled}
            className={cn(
                switchWrapperVariants({ variant }),
                disabled && 'cursor-not-allowed! opacity-80',
                className,
            )}
        >
            <Switch
                id={switchId}
                variant={variant}
                size={size}
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

export default SwitchWrapper;
