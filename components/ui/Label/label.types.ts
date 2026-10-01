import { type Label as LabelPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export type LabelProps = ComponentProps<typeof LabelPrimitive.Root> & {
    disabled?: boolean;
    required?: boolean;
};
