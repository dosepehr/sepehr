import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type { badgeVariants } from '.';

export type BadgeWrapperProps = ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean;
    };
