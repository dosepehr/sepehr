'use client';
/* c8 ignore stop */

import { cn } from '@/lib/funcs/cn';
import { AnimatePresence, motion } from 'motion/react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import * as React from 'react';

export const CollapsibleContext = React.createContext(false);

const CollapsibleTrigger = ({
    ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => {
    return (
        <CollapsiblePrimitive.CollapsibleTrigger
            data-slot="collapsible-trigger"
            {...props}
        />
    );
};

const CollapsibleContent = ({
    className,
    children,
    ...props
}: Omit<
    React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>,
    'forceMount'
>) => {
    const isOpen = React.useContext(CollapsibleContext);

    // AnimatePresence must wrap the conditional render, not sit *inside* the
    // asChild target — it doesn't forward unknown props (id, aria-*) to its
    // children, so Radix's Slot merge onto it would never reach the real DOM
    // node, leaving the trigger's aria-controls pointing at a nonexistent id.
    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" forceMount {...props} render={<motion.div key="collapsible-content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: 'hidden' }} className={cn(className)} />}>{children}</CollapsiblePrimitive.CollapsibleContent>
            )}
        </AnimatePresence>
    );
};

export { CollapsibleContent, CollapsibleTrigger };
