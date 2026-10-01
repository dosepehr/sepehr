import type { VariantProps } from 'class-variance-authority';
import type { ComponentType, ReactNode } from 'react';
import type { alertVariants } from './components';

export type AlertVariant = NonNullable<
    VariantProps<typeof alertVariants>['variant']
>;

export type AlertWrapperProps = {
    title?: ReactNode;
    children: ReactNode;
    variant?: AlertVariant;
    Icon?: ComponentType<{ size?: number; className?: string }>;
};
