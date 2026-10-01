import type { ErrorInfo, ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

type ErrorBoundaryResetDetails =
    | { reason: 'imperative-api'; args: unknown[] }
    | {
          reason: 'keys';
          prev: unknown[] | undefined;
          next: unknown[] | undefined;
      };

export type ErrorBoundaryWrapperProps = {
    children: ReactNode;
    /** Title shown by the default fallback. Ignored if `fallback` is passed. */
    title?: string;
    /** Description shown by the default fallback; defaults to the error message. */
    description?: string;
    /** Custom fallback renderer, replacing the default `Empty`-based UI entirely. */
    fallback?: (props: FallbackProps) => ReactNode;
    onError?: (error: unknown, info: ErrorInfo) => void;
    onReset?: (details: ErrorBoundaryResetDetails) => void;
    /** Resets the boundary whenever any value in this array changes (e.g. a route param). */
    resetKeys?: unknown[];
};
