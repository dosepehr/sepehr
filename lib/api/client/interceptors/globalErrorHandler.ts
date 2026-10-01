import type { AxiosError, AxiosInstance } from 'axios';
import { mapErrorToToast } from '@/lib/api/client/mapErrorToToast';

export const globalErrorHandler = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            mapErrorToToast(error);
            return Promise.reject(error);
        },
    );
};
