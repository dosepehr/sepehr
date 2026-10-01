'use client';
/* c8 ignore stop */

import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import * as React from 'react';
import { CollapsibleContext } from './components';

const Collapsible = ({
    open,
    defaultOpen,
    onOpenChange,
    ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false);
    const controlled = open !== undefined;
    const currentOpen = controlled ? open : isOpen;

    const handleChange = (val: boolean) => {
        if (!controlled) setIsOpen(val);
        onOpenChange?.(val);
    };

    return (
        <CollapsibleContext.Provider value={currentOpen}>
            <CollapsiblePrimitive.Root
                data-slot="collapsible"
                open={currentOpen}
                onOpenChange={handleChange}
                {...props}
            />
        </CollapsibleContext.Provider>
    );
};

export { CollapsibleContent, CollapsibleTrigger } from './components';

export default Collapsible;
