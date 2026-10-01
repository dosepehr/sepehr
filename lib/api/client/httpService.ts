import axios from 'axios';
import Cookies from 'universal-cookie';
import { env } from '@/lib/env';
import { globalErrorHandler } from './interceptors/globalErrorHandler';
import { setupRefreshToken } from './interceptors/refreshToken';

export const httpService = axios.create({
    baseURL: env.NEXT_PUBLIC_APP_BASE_URL,
});

httpService.interceptors.request.use(
    (config) => {
        const cookies = new Cookies();
        const token = cookies.get('access-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const isFormData = config.data instanceof FormData;
        if (!isFormData) {
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => Promise.reject(error),
);

httpService.interceptors.response.use((response) => response.data);
setupRefreshToken(httpService);
globalErrorHandler(httpService);
