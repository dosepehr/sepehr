import type { Accordion as AccordionPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

type AccordionItemProps = ComponentProps<typeof AccordionPrimitive.Item>;
type AccordionTriggerProps = ComponentProps<typeof AccordionPrimitive.Trigger>;
type AccordionContentProps = ComponentProps<typeof AccordionPrimitive.Content>;

export type AccordionWrapperProps = {
    trigger: ReactNode;
    children: ReactNode;
    itemProps?: Omit<AccordionItemProps, 'value'>;
    triggerProps?: AccordionTriggerProps;
    contentProps?: AccordionContentProps;
} & Pick<AccordionItemProps, 'value' | 'className' | 'disabled'>;
