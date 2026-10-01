import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/types/DTO/http-errors.interface';
import { errorHandler, networkErrorStrategy } from './http-error-strategies';

export function mapErrorToToast(error: AxiosError) {
    const res = error.response;

    if (!res) {
        toast.error(networkErrorStrategy().message);
        return;
    }

    const data = res.data as ApiError | undefined;

    if (!data) {
        toast.error('An unexpected error occurred.');
        return;
    }

    const handler = errorHandler[res.status];
    const finalErr = handler ? handler(data) : data;

    toast.error(extractErrorMessage(finalErr));
}

function extractErrorMessage(error: ApiError): string {
    if (error.errors && typeof error.errors === 'object') {
        const firstValue = Object.values(error.errors)[0];
        const firstError = Array.isArray(firstValue)
            ? firstValue[0]
            : String(firstValue);
        if (firstError) return firstError;
    }

    if (error.message) return error.message;

    return 'Something went wrong. Please try again.';
}
