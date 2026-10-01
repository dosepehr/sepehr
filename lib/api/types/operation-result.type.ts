import type { Problem } from './DTO/http-errors.interface';

export type OperationResult<T> = {
    isSuccess: boolean;
    error?: Problem;
    response?: T;
};

export interface SuccessResponse<T = undefined> {
    status: boolean;
    message?: string;
    data?: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
