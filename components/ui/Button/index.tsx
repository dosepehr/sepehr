'use client';

import { ArrowRightCircle } from 'lucide-react';
import type { FC } from 'react';
import Spinner from '@/components/ui/Spinner';
import type { ButtonWrapperProps } from './button.types';
import { Button as ButtonComponent } from './components';

const Button: FC<ButtonWrapperProps> = ({
    children,
    isLoading = false,
    loadingText = 'Loading...',
    showArrow = false,
    disabled,
    asChild = false,
    ...props
}) => {
    // When `asChild` is set, Radix's Slot requires exactly one element
    // child (the thing being "merged" into) — skip the loading/arrow
    // wrapping so `children` (e.g. a single <Link>) passes through as-is.
    const content = asChild ? (
        children
    ) : (
        <>
            {isLoading ? (
                <>
                    {loadingText}
                    <Spinner />
                </>
            ) : (
                children
            )}
            {!isLoading && showArrow && (
                <ArrowRightCircle className="duration-150 group-hover/button:translate-x-1" />
            )}
        </>
    );

    return (
        <ButtonComponent
            disabled={disabled || isLoading}
            {...props}
        >
            {content}
        </ButtonComponent>
    );
};

export default Button;
