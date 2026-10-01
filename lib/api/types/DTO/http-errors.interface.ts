export interface ErrorResponse {
    status: false;
    message: string;
    errors?: Record<string, string[]>;
}

interface Problem extends ErrorResponse {
    type?: string;
}

interface BadRequestError extends Problem {
    type: 'BadRequest';
}

interface UnauthorizedError extends Problem {
    type: 'Unauthorized';
}

interface ValidationError extends Problem {
    type: 'ValidationError';
}

interface NotFoundError extends Problem {
    type: 'NotFound';
}

interface UnhandledException extends Problem {
    type: 'UnhandledException';
}

interface NetworkError extends Problem {
    type: 'NetworkError';
}

interface ConflictError extends Problem {
    type: 'Conflict';
}
type ApiError =
    | BadRequestError
    | NetworkError
    | NotFoundError
    | UnhandledException
    | UnauthorizedError
    | ValidationError
    | ConflictError;

export type {
    ApiError,
    BadRequestError,
    ConflictError,
    NetworkError,
    NotFoundError,
    Problem,
    UnauthorizedError,
    UnhandledException,
    ValidationError,
};
