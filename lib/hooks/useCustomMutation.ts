import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query';
import type { ApiError } from '@/lib/api/types/DTO/http-errors.interface';

/**
 * UseCustomMutationOptions - options for useCustomMutation hook
 * @template V - type of variables/input
 * @template T - type of mutation result
 * @template E - type of error (defaults to ApiError)
 */
interface UseCustomMutationOptions<V, T, E = ApiError> extends Omit<
    UseMutationOptions<T, E, V>,
    'mutationFn'
> {
    /**
     * mutationFn - the function that performs the mutation
     * @param variables - the input data for the mutation
     * @returns a Promise resolving to the mutation result
     */
    mutationFn: (variables: V) => Promise<T>;
}

/**
 * useCustomMutation - a reusable React Query mutation hook
 * @template V - type of variables/input
 * @template T - type of mutation result
 * @template E - type of error (defaults to ApiError)
 * @param options - configuration options for the mutation
 * @returns React Query's UseMutationResult with types T, E, V
 *
 * @example
 * const { mutate, isLoading, error } = useCustomMutation({
 *   mutationFn: async (data: MyDTO) => {
 *     const response = await api.post('/endpoint', data);
 *     return response.data;
 *   },
 *   onSuccess: () => console.log('Mutation successful!'),
 * });
 */
const useCustomMutation = <V, T, E = ApiError>({
    mutationFn,
    ...otherConfig
}: UseCustomMutationOptions<V, T, E>): UseMutationResult<T, E, V> =>
    useMutation<T, E, V>({
        mutationFn,
        ...otherConfig,
    });

export default useCustomMutation;
