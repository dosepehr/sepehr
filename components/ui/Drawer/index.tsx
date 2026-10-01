'use client';

import { cn } from '@/lib/funcs/cn';
import { cloneElement } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from './components';
import type { DrawerWrapperProps } from './drawer.types';

const DrawerWrapper = ({
    trigger,
    triggerChildren,
    title,
    description,
    hideHeader = false,
    children,
    footer,
    showHandle = false,
    contentClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    titleClassName,
    descriptionClassName,
    ...props
}: DrawerWrapperProps) => {
    return (
        <Drawer {...props}>
            {trigger && (
                <DrawerTrigger>
                    {triggerChildren !== undefined
                        ? cloneElement(trigger, undefined, triggerChildren)
                        : trigger}
                </DrawerTrigger>
            )}
            <DrawerContent className={contentClassName} showHandle={showHandle}>
                {!hideHeader && (title || description) && (
                    <DrawerHeader className={headerClassName}>
                        {title && (
                            <DrawerTitle className={titleClassName}>
                                {title}
                            </DrawerTitle>
                        )}
                        {description && (
                            <DrawerDescription className={descriptionClassName}>
                                {description}
                            </DrawerDescription>
                        )}
                    </DrawerHeader>
                )}
                {children && (
                    <div
                        data-slot="drawer-body"
                        className={cn('p-4', bodyClassName)}
                    >
                        {children}
                    </div>
                )}
                {footer && (
                    <DrawerFooter className={footerClassName}>
                        {footer}
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
};

export default DrawerWrapper;
export { DrawerClose };
