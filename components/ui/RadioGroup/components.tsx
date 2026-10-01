'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva } from 'class-variance-authority';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';
import Label from '@/components/ui/Label';
import type { RadioGroupItemProps } from './radio-group.types';

export const radioGroupItemVariants = cva(
    'group/radio-item peer relative flex aspect-square size-4 shrink-0 rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
    {
        variants: {
            variant: {
                default:
                    'border-input focus-visible:border-ring data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
                success:
                    'border-input focus-visible:border-success data-checked:border-success data-checked:bg-success data-checked:text-white',
                warning:
                    'border-input focus-visible:border-warning data-checked:border-warning data-checked:bg-warning data-checked:text-black',
                destructive:
                    'border-input focus-visible:border-destructive data-checked:border-destructive data-checked:bg-destructive data-checked:text-white',
                info: 'border-input focus-visible:border-info data-checked:border-info data-checked:bg-info data-checked:text-info-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export const radioGroupWrapperVariants = cva(
    'cursor-pointer flex items-start gap-3 px-3 py-2 rounded-md border transition-colors',
    {
        variants: {
            variant: {
                default:
                    'border-border hover:bg-accent has-[[data-state=checked]]:border-input has-[[data-state=checked]]:bg-accent',
                success:
                    'border-border hover:bg-success/10 has-[[data-state=checked]]:border-success has-[[data-state=checked]]:bg-success/10',
                warning:
                    'border-border hover:bg-warning/10 has-[[data-state=checked]]:border-warning has-[[data-state=checked]]:bg-warning/10',
                destructive:
                    'border-border hover:bg-destructive/10 has-[[data-state=checked]]:border-destructive has-[[data-state=checked]]:bg-destructive/10',
                info: 'border-border hover:bg-info/10 has-[[data-state=checked]]:border-info has-[[data-state=checked]]:bg-info/10',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const RadioGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) => {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('grid w-full gap-2', className)}
            {...props}
        />
    );
};

const RadioGroupItem = ({
    className,
    variant,
    label,
    id,
    ...props
}: RadioGroupItemProps) => {
    const root = (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            id={id}
            className={cn(radioGroupItemVariants({ variant }), className)}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="flex size-4 items-center justify-center"
            >
                <span className="absolute start-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current rtl:translate-x-1/2" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );

    // Only self-wrap in a <label> when there's text to associate — an empty
    // wrapping label would otherwise win accessible-name computation over an
    // outer label a consumer (e.g. RadioGroupWrapper) renders with real text.
    if (!label) return root;

    return (
        <Label className="flex w-fit items-center gap-2 font-normal">
            {root}
            <span className="text-sm leading-none">{label}</span>
        </Label>
    );
};

export { RadioGroup, RadioGroupItem };
