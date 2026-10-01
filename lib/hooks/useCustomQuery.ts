import {
    useQuery,
    type QueryKey,
    type UseQueryOptions,
    type UseQueryResult,
} from '@tanstack/react-query';
import type { ApiError } from '@/lib/api/types/DTO/http-errors.interface';

/**
 * UseCustomQueryOptions - options for useCustomQuery hook
 * @template T - type of the data returned by the query
 * @template E - type of error (defaults to ApiError)
 */
interface UseCustomQueryOptions<T, E = ApiError> extends Omit<
    UseQueryOptions<T, E, T>,
    'queryKey' | 'queryFn'
> {
    /**
     * queryKey - a unique key to identify the query
     */
    queryKey: QueryKey;

    /**
     * queryFn - the function that fetches the data
     * @returns a Promise resolving to the query data
     */
    queryFn: () => Promise<T>;
}

/**
 * useCustomQuery - a reusable React Query hook for fetching data
 * @template T - type of the data returned by the query
 * @template E - type of error (defaults to ApiError)
 * @param options - configuration options for the query
 * @returns React Query's UseQueryResult with types T and E
 *
 * @example
 * const { data, isLoading, error } = useCustomQuery({
 *   queryKey: ['user', userId],
 *   queryFn: async () => {
 *     const response = await api.get(`/users/${userId}`);
 *     return response.data;
 *   },
 *   staleTime: 1000 * 60, // optional config
 * });
 */
const useCustomQuery = <T, E = ApiError>({
    queryKey,
    queryFn,
    ...otherConfig
}: UseCustomQueryOptions<T, E>): UseQueryResult<T, E> =>
    useQuery<T, E, T>({
        queryKey,
        queryFn,
        ...otherConfig,
    });

export default useCustomQuery;
