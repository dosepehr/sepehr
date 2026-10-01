'use client';

import { AlertTriangle } from 'lucide-react';
import type { FC } from 'react';
import {
    ErrorBoundary,
    getErrorMessage,
    type FallbackProps,
} from 'react-error-boundary';
import Button from '@/components/ui/Button';
import EmptyWrapper from '@/components/ui/Empty';
import type { ErrorBoundaryWrapperProps } from './error-boundary.types';

const DefaultFallback: FC<
    FallbackProps & Pick<ErrorBoundaryWrapperProps, 'title' | 'description'>
> = ({ error, resetErrorBoundary, title, description }) => (
    <EmptyWrapper
        icon={<AlertTriangle />}
        title={title ?? 'Something went wrong'}
        description={description ?? getErrorMessage(error)}
        action={
            <Button variant="outline" onClick={() => resetErrorBoundary()}>
                Try again
            </Button>
        }
    />
);

const ErrorBoundaryWrapper: FC<ErrorBoundaryWrapperProps> = ({
    children,
    title,
    description,
    fallback,
    onError,
    onReset,
    resetKeys,
}) => {
    return (
        <ErrorBoundary
            onError={onError}
            onReset={onReset}
            resetKeys={resetKeys}
            fallbackRender={
                fallback ??
                ((props) => (
                    <DefaultFallback
                        {...props}
                        title={title}
                        description={description}
                    />
                ))
            }
        >
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundaryWrapper;
