import { cn } from '@/lib/funcs/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2Icon } from 'lucide-react';

export const spinnerVariants = cva('animate-spin shrink-0', {
    variants: {
        size: {
            sm: 'size-3.5',
            default: 'size-4',
            lg: 'size-5',
            xl: 'size-6',
        },
        variant: {
            default: 'text-muted-foreground',
            primary: 'text-primary',
            success: 'text-success',
            warning: 'text-warning',
            destructive: 'text-destructive',
            info: 'text-info',
            inherit: 'text-current',
        },
    },
    defaultVariants: {
        size: 'default',
        variant: 'inherit',
    },
});

const Spinner = ({
    className,
    size,
    variant,
    ...props
}: React.ComponentProps<'svg'> & VariantProps<typeof spinnerVariants>) => {
    return (
        <Loader2Icon
            role="status"
            aria-label="Loading"
            className={cn(spinnerVariants({ size, variant }), className)}
            {...props}
        />
    );
};

export default Spinner;
