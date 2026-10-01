import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { buttonVariants } from './components';

export type ButtonWrapperProps = ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        isLoading?: boolean;
        loadingText?: string;
        showArrow?: boolean;
    };
