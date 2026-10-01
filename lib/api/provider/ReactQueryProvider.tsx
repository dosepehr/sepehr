'use client';

import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { FC, PropsWithChildren } from 'react';

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => console.error('[QueryCache]', error),
    }),
    mutationCache: new MutationCache({
        onError: (error) => console.error('[MutationCache]', error),
    }),
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            throwOnError: false,
            gcTime: 1000 * 60 * 60 * 24, // 24h — inactive cache is garbage-collected after this
            staleTime: 1000 * 60 * 60 * 5, // 5h  — data is re-fetched after this
        },
    },
});

const ReactQueryProvider: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);

export default ReactQueryProvider;
