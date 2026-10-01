'use client';

import type { FC } from 'react';
import type { AccordionWrapperProps } from './accordion.types';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './components';

const AccordionWrapper: FC<AccordionWrapperProps> = ({
    value,
    className,
    disabled,
    trigger,
    children,
    itemProps,
    triggerProps,
    contentProps,
}) => {
    return (
        <AccordionItem
            value={value}
            className={className}
            disabled={disabled}
            {...itemProps}
        >
            <AccordionTrigger {...triggerProps}>{trigger}</AccordionTrigger>
            <AccordionContent {...contentProps}>{children}</AccordionContent>
        </AccordionItem>
    );
};

export default AccordionWrapper;
