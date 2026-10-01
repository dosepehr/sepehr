'use client';

import Button from '@/components/ui/Button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './components';
import type { SheetWrapperProps } from './sheet.types';

const SheetWrapper = ({
    trigger,
    title,
    description,
    children,
    footer,
    side = 'right',
    open,
    onOpenChange,
    showCloseButton = true,
    contentClassName,
}: SheetWrapperProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger>{trigger}</SheetTrigger>}
            <SheetContent
                side={side}
                showCloseButton={showCloseButton}
                className={contentClassName}
            >
                {(title || description) && (
                    <SheetHeader>
                        {title && <SheetTitle>{title}</SheetTitle>}
                        {description && (
                            <SheetDescription>{description}</SheetDescription>
                        )}
                    </SheetHeader>
                )}
                {children && (
                    <div className="flex-1 overflow-y-auto px-4">
                        {children}
                    </div>
                )}
                {footer && (
                    <SheetFooter>
                        {footer}
                        <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default SheetWrapper;
