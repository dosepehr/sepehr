import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import type { spinnerVariants } from '.';

export type SpinnerProps = React.ComponentProps<'svg'> &
    VariantProps<typeof spinnerVariants>;
