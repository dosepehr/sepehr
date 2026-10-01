import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

export const badgeVariants = cva(
    'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
    {
        variants: {
            variant: {
                default: '',
                secondary: '',
                destructive: '',
                success: '',
                warning: '',
                info: '',
                outline:
                    'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
                ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
                link: 'text-primary-text underline-offset-4 hover:underline',
            },
            appearance: {
                solid: '',
                soft: '',
            },
        },
        compoundVariants: [
            // solid
            {
                variant: 'default',
                appearance: 'solid',
                className:
                    'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
            },
            {
                variant: 'secondary',
                appearance: 'solid',
                className:
                    'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
            },
            {
                variant: 'destructive',
                appearance: 'solid',
                className:
                    'bg-destructive text-white [a]:hover:bg-destructive/80',
            },
            {
                variant: 'success',
                appearance: 'solid',
                className:
                    'bg-success text-success-foreground [a]:hover:bg-success/80',
            },
            {
                variant: 'warning',
                appearance: 'solid',
                className:
                    'bg-warning text-warning-foreground [a]:hover:bg-warning/80',
            },
            {
                variant: 'info',
                appearance: 'solid',
                className: 'bg-info text-info-foreground [a]:hover:bg-info/80',
            },
            // soft
            {
                variant: 'default',
                appearance: 'soft',
                className:
                    'bg-primary/10 text-primary-text [a]:hover:bg-primary/20',
            },
            {
                variant: 'secondary',
                appearance: 'soft',
                className:
                    'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
            },
            {
                variant: 'destructive',
                appearance: 'soft',
                className:
                    'bg-destructive/10 text-destructive-text focus-visible:ring-destructive/20 dark:bg-destructive/20 [a]:hover:bg-destructive/20',
            },
            {
                variant: 'success',
                appearance: 'soft',
                className:
                    'bg-success/10 text-success-text dark:bg-success/20 [a]:hover:bg-success/20',
            },
            {
                variant: 'warning',
                appearance: 'soft',
                className:
                    'bg-warning/10 text-warning-text dark:bg-warning/20 [a]:hover:bg-warning/20',
            },
            {
                variant: 'info',
                appearance: 'soft',
                className:
                    'bg-info/10 text-info-text dark:bg-info/20 [a]:hover:bg-info/20',
            },
        ],
        defaultVariants: {
            variant: 'default',
            appearance: 'soft',
        },
    },
);

const Badge = ({
    className,
    variant = 'default',
    appearance = 'soft',
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
    const Comp = asChild ? Slot.Root : 'span';

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            data-appearance={appearance}
            className={cn(badgeVariants({ variant, appearance }), className)}
            {...props}
        />
    );
};

export default Badge;
