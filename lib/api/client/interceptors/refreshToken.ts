import axios, {
    type AxiosError,
    type AxiosInstance,
    type InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'universal-cookie';
import { env } from '@/lib/env';

const cookies = new Cookies();

let isRefreshing = false;
let failedQueue: Array<{
    resolve: () => void;
    reject: (reason: unknown) => void;
}> = [];

const COOKIE_BASE = { path: '/' } as const;
const ACCESS_TOKEN_OPTIONS = {
    ...COOKIE_BASE,
    maxAge: 15 * 60,
    secure: true,
    sameSite: 'strict' as const,
};
const REFRESH_TOKEN_OPTIONS = {
    ...COOKIE_BASE,
    maxAge: 7 * 24 * 60 * 60,
    secure: true,
    sameSite: 'strict' as const,
};

const AUTH_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
] as const;

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const processQueue = (error: unknown) => {
    for (const prom of failedQueue) {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    }
    failedQueue = [];
};

const clearAuthAndRedirect = () => {
    cookies.remove('access-token', COOKIE_BASE);
    cookies.remove('refresh-token', COOKIE_BASE);
    window.location.href = '/auth';
};

export const setupRefreshToken = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as RetryableRequest;

            const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) =>
                originalRequest?.url?.includes(ep),
            );

            if (
                isAuthEndpoint ||
                error.response?.status !== 401 ||
                originalRequest._retry
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<void>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => client(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = cookies.get<string | undefined>(
                'refresh-token',
            );

            if (!refreshToken) {
                isRefreshing = false;
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post<{
                    accessToken: string;
                    refreshToken?: string;
                }>(`${env.NEXT_PUBLIC_APP_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                if (!data.accessToken) {
                    processQueue(error);
                    isRefreshing = false;
                    clearAuthAndRedirect();
                    return Promise.reject(error);
                }

                cookies.set(
                    'access-token',
                    data.accessToken,
                    ACCESS_TOKEN_OPTIONS,
                );
                if (data.refreshToken) {
                    cookies.set(
                        'refresh-token',
                        data.refreshToken,
                        REFRESH_TOKEN_OPTIONS,
                    );
                }

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                processQueue(null);
                isRefreshing = false;
                return client(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        },
    );
};
