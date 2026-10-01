'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { cva } from 'class-variance-authority';
import { Switch as SwitchPrimitive } from 'radix-ui';
import Label from '@/components/ui/Label';
import type { SwitchProps } from './switch.types';

export const switchVariants = cva(
    'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]',
    {
        variants: {
            variant: {
                default:
                    'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80',
                success:
                    'data-checked:bg-success data-unchecked:bg-input dark:data-unchecked:bg-input/80',
                warning:
                    'data-checked:bg-warning data-unchecked:bg-input dark:data-unchecked:bg-input/80',
                destructive:
                    'data-checked:bg-destructive data-unchecked:bg-input dark:data-unchecked:bg-input/80',
                info: 'data-checked:bg-info data-unchecked:bg-input dark:data-unchecked:bg-input/80',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export const switchWrapperVariants = cva(
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

const Switch = ({
    className,
    variant,
    size = 'default',
    label,
    id,
    required,
    ...props
}: SwitchProps) => {
    const root = (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            id={id}
            className={cn(switchVariants({ variant }), className)}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(100%-2px)] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
            />
        </SwitchPrimitive.Root>
    );

    // Only self-wrap in a <label> when there's text to associate — an empty
    // wrapping label would otherwise win accessible-name computation over an
    // outer label a consumer (e.g. SwitchWrapper) renders with real text.
    if (!label) return root;

    return (
        <Label
            className="flex w-fit items-center gap-2 font-normal"
            required={required}
        >
            {root}
            <span className="text-sm leading-none">{label}</span>
        </Label>
    );
};

export { Switch };
