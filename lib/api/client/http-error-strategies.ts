import type {
    ApiError,
    BadRequestError,
    ConflictError,
    NetworkError,
    NotFoundError,
    UnauthorizedError,
    UnhandledException,
    ValidationError,
} from '@/lib/api/types/DTO/http-errors.interface';

export type ApiErrorHandler = (errorData: ApiError) => ApiError;

export const badRequestErrorStrategy: ApiErrorHandler = (errorData) =>
    ({ ...errorData }) as BadRequestError;

export const validationErrorStrategy: ApiErrorHandler = (errorData) =>
    ({ ...errorData }) as ValidationError;

export const notFoundErrorStrategy: ApiErrorHandler = (errorData) =>
    ({
        ...errorData,
        message: 'The requested resource was not found.',
    }) as NotFoundError;

export const unauthorizedErrorStrategy: ApiErrorHandler = (errorData) =>
    ({
        ...errorData,
        message: 'Unauthorized. Please sign in again.',
    }) as UnauthorizedError;

export const unhandledExceptionStrategy: ApiErrorHandler = (errorData) =>
    ({
        ...errorData,
        message: 'Server error. Please try again later.',
    }) as UnhandledException;

export const conflictErrorStrategy: ApiErrorHandler = (errorData) =>
    ({ ...errorData, message: 'Conflict. Please try again.' }) as ConflictError;

export const networkErrorStrategy = (): NetworkError =>
    ({
        message: 'Network error. Please check your internet connection.',
    }) as NetworkError;

export const errorHandler: Record<number, ApiErrorHandler> = {
    400: (errorData) =>
        (errorData.message ? validationErrorStrategy : badRequestErrorStrategy)(
            errorData,
        ),
    401: unauthorizedErrorStrategy,
    403: unauthorizedErrorStrategy,
    404: notFoundErrorStrategy,
    409: conflictErrorStrategy,
    422: badRequestErrorStrategy,
    500: unhandledExceptionStrategy,
};
