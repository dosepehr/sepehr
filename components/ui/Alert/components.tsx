import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const alertVariants = cva(
    "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'bg-red-50 border-red-200 text-destructive-text *:data-[slot=alert-description]:text-destructive-text/90 *:[svg]:text-current',
                info: 'bg-blue-50 text-blue-800 border-blue-200 *:data-[slot=alert-description]:text-blue-700/90 *:[svg]:text-blue-600',
                success:
                    'bg-green-50 text-green-900 border-green-200 *:data-[slot=alert-description]:text-green-800/90 *:[svg]:text-green-700',
                warning:
                    'bg-yellow-50 text-yellow-900 border-yellow-200 *:data-[slot=alert-description]:text-yellow-800/90 *:[svg]:text-yellow-700',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

const Alert = ({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) => {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    );
};

const AlertTitle = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="alert-title"
            className={cn(
                'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
                className,
            )}
            {...props}
        />
    );
};

const AlertDescription = ({
    className,
    ...props
}: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
                className,
            )}
            {...props}
        />
    );
};

const AlertAction = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="alert-action"
            className={cn('absolute end-2 top-2', className)}
            {...props}
        />
    );
};

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
export type { VariantProps };
