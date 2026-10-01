'use client';
/* c8 ignore stop */

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

const Tabs = ({
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) => {
    return <TabsPrimitive.Root data-slot="tabs" {...props} />;
};

export * from './components';

export default Tabs;
