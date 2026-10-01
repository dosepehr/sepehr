'use client';

import type { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from './components';
import type { ToggleGroupWrapperProps } from './toggle-group.types';

const ToggleGroupWrapper: FC<ToggleGroupWrapperProps> = ({
    items,
    variant,
    size,
    spacing,
    orientation,
    ...props
}) => {
    return (
        <ToggleGroup
            variant={variant}
            size={size}
            spacing={spacing}
            orientation={orientation}
            {...props}
        >
            {items.map(({ label, value, ...itemProps }) => (
                <ToggleGroupItem key={value} value={value} {...itemProps}>
                    {label ?? value}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
};

export default ToggleGroupWrapper;
